import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import QRCode from 'qrcode';
import { z } from 'zod';
import {
  buildOtpAuthUri,
  generateRecoveryCodes,
  generateTotpSecret,
  verifyTotpCode,
} from './server/totp.ts';
import { verifyFirebaseIdToken } from './server/firebaseTokenVerifier.ts';
import {
  AdminRole,
  PRIMARY_OWNER_EMAIL,
  acceptInvitation,
  addAdminNotification,
  bootstrapOwnerPassword,
  checkRateLimit,
  consumeChallenge,
  consumeRecoveryCode,
  createChallenge,
  createInvitation,
  createSession,
  enableAdminTotp,
  getAdminByEmail,
  getAdminById,
  getAnalyticsSummary,
  getChallengeByToken,
  getInvitationByToken,
  incrementChallengeAttempts,
  listActiveSessions,
  listAdmins,
  listBackups,
  listInvitations,
  listNotifications,
  listSecurityEvents,
  logSecurityEvent,
  markNotificationRead,
  maskIpAddress,
  needsInitialBootstrap,
  recordAnalyticsEvent,
  recordBackupAction,
  recordFailedLoginAttempt,
  replaceRecoveryCodes,
  resetAdminTotpForRecovery,
  resetLoginFailures,
  restoreAdminAccess,
  revokeAdminAccess,
  revokeInvitation,
  revokeOtherSessions,
  revokeSessionById,
  sanitizeAdmin,
  setChallengePendingSecret,
  sha256Hex,
  updateAdminPassword,
  updateAdminRole,
  updateLastTotpStep,
  verifyAdminPassword,
  verifySessionToken,
} from './server/securityStore.ts';

const app = express();
app.set('trust proxy', true);
const PORT = Number(process.env.PORT) || 3000;
const SESSION_COOKIE_NAME = 'ash_admin_session';

// Ensure public upload directories exist
const uploadRoot = path.join(process.cwd(), 'public', 'uploads');
const uploadDirs = [
  uploadRoot,
  path.join(uploadRoot, 'cv'),
  path.join(uploadRoot, 'media'),
  path.join(uploadRoot, 'profile'),
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Helper: Extract client IP safely
function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '0.0.0.0';
}

// Helper: Parse cookies cleanly without extra middleware dependency
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  cookieHeader.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    if (key) {
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  });
  return result;
}

function getRequestToken(req: express.Request): string {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_COOKIE_NAME] || '';
}

function setSessionCookie(req: express.Request, res: express.Response, token: string) {
  const isHttps =
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    process.env.NODE_ENV === 'production';

  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${12 * 60 * 60}`,
    isHttps ? 'SameSite=None' : 'SameSite=Lax',
  ];
  if (isHttps) {
    parts.push('Secure');
    parts.push('Partitioned');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(req: express.Request, res: express.Response) {
  const isHttps =
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    process.env.NODE_ENV === 'production';

  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'Max-Age=0',
    isHttps ? 'SameSite=None' : 'SameSite=Lax',
  ];
  if (isHttps) {
    parts.push('Secure');
    parts.push('Partitioned');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

// Strict Origin Allowlist (No wildcard * on authenticated routes)
function isAllowedOrigin(origin: string | undefined, hostHeader: string | undefined): boolean {
  if (!origin) return true; // Same-origin or direct navigation
  try {
    const parsed = new URL(origin);
    if (hostHeader && parsed.host === hostHeader) return true;
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === 'ash-wickramasinghe.site' ||
      host.endsWith('.ash-wickramasinghe.site') ||
      host.endsWith('.run.app') ||
      host.endsWith('.aistudio.google.com') ||
      host.endsWith('.googleusercontent.com')
    ) {
      return true;
    }
    const appUrl = process.env.APP_URL;
    if (appUrl) {
      try {
        if (new URL(appUrl).origin === parsed.origin) return true;
      } catch {
        // ignore invalid APP_URL
      }
    }
  } catch {
    return false;
  }
  return false;
}

// Global Security Headers & CORS Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  // Content Security Policy allowing Google Fonts, Firebase Auth/Firestore, Vite dev HMR, and QR Data URLs
  // No frame-ancestors restriction so AI Studio preview iframe works seamlessly
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://*.googleusercontent.com https://*.firebasestorage.app https://firebasestorage.googleapis.com https://ash-wickramasinghe.site",
    "connect-src 'self' ws: wss: https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.google-analytics.com",
    "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com blob: data:",
    "object-src 'self' blob: data:",
    "base-uri 'self'",
  ].join('; ');
  res.setHeader('Content-Security-Policy', csp);

  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
  const hostHeader = typeof req.headers.host === 'string' ? req.headers.host : undefined;
  if (origin && isAllowedOrigin(origin, hostHeader)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Serve uploads statically with nosniff & safe inline headers
app.use(
  '/uploads',
  express.static(uploadRoot, {
    setHeaders: (res, filePath) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (/\.(html?|svg|js|mjs|cjs|xml)$/i.test(filePath)) {
        res.setHeader('Content-Disposition', 'attachment');
      }
    },
  })
);

// Role Hierarchy & Auth Middleware
const ROLE_LEVEL: Record<AdminRole, number> = {
  editor: 1,
  admin: 2,
  super_admin: 3,
};

interface AuthenticatedRequest extends express.Request {
  authContext?: {
    sessionId: string;
    adminId: string;
    email: string;
    name: string;
    role: AdminRole;
  };
}

function requireCsrfSafe(req: express.Request, res: express.Response, next: express.NextFunction) {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
  const hostHeader = typeof req.headers.host === 'string' ? req.headers.host : undefined;
  if (origin && !isAllowedOrigin(origin, hostHeader)) {
    return res.status(403).json({ error: 'Blocked by Cross-Site Request Forgery origin policy.' });
  }
  // If using cookie auth without Bearer header, require X-Requested-With on mutating requests
  const hasBearer = typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ');
  if (!hasBearer && req.method !== 'GET' && req.method !== 'HEAD') {
    if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
      return res.status(403).json({ error: 'Missing required CSRF security header.' });
    }
  }
  next();
}

function requireAuth(minRole: AdminRole = 'editor') {
  return (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    const token = getRequestToken(req);
    const verified = verifySessionToken(token);
    if (!verified || !verified.session.totpVerified) {
      return res.status(401).json({ error: 'Authentication with verified 2FA session required.' });
    }
    if (!verified.admin.totpEnabled) {
      return res.status(403).json({ error: 'Google Authenticator 2FA enrollment must be completed.' });
    }
    if (ROLE_LEVEL[verified.admin.role] < ROLE_LEVEL[minRole]) {
      return res.status(403).json({ error: 'Insufficient administrator role privileges for this operation.' });
    }

    req.authContext = {
      sessionId: verified.session.id,
      adminId: verified.admin.id,
      email: verified.admin.email,
      name: verified.admin.name,
      role: verified.admin.role,
    };
    next();
  };
}

function verifyStepUpOtp(adminId: string, totpCode: unknown): { ok: boolean; error?: string } {
  const admin = getAdminById(adminId);
  if (!admin) return { ok: false, error: 'Administrator record not found.' };
  if (!admin.totpEnabled || !admin.totpSecret) {
    return { ok: false, error: 'Authenticator 2FA is not active on this account.' };
  }
  if (typeof totpCode !== 'string' || !/^\d{6}$/.test(totpCode.replace(/\s+/g, ''))) {
    return { ok: false, error: 'Step-up verification requires a valid 6-digit authenticator code.' };
  }
  const result = verifyTotpCode(admin.totpSecret, totpCode, admin.lastTotpStep, 1);
  if (!result.valid || result.matchedStep === undefined) {
    return { ok: false, error: result.reason || 'Invalid 2FA verification code.' };
  }
  updateLastTotpStep(admin.id, result.matchedStep);
  return { ok: true };
}

/* =========================================================================
   AUTHENTICATION & GOOGLE AUTHENTICATOR 2FA ROUTES
   ========================================================================= */

app.get('/api/auth/status', (req, res) => {
  const inviteToken = typeof req.query.invite === 'string' ? req.query.invite : '';
  const inv = inviteToken ? getInvitationByToken(inviteToken) : undefined;
  let firebaseProjectId = '';
  try {
    const cfgPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(cfgPath)) {
      firebaseProjectId = JSON.parse(fs.readFileSync(cfgPath, 'utf8')).projectId || '';
    }
  } catch {
    // ignore
  }
  res.json({
    needsBootstrap: needsInitialBootstrap(),
    primaryOwnerEmail: PRIMARY_OWNER_EMAIL,
    firebaseProjectId,
    inviteValid: Boolean(inv),
    inviteDetails: inv ? { email: inv.email, name: inv.name, role: inv.role } : null,
  });
});

app.post('/api/auth/bootstrap', (req, res) => {
  const ip = getClientIp(req);
  const maskedIp = maskIpAddress(ip);
  const ua = req.headers['user-agent'] || '';

  const rl = checkRateLimit(`bootstrap:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ error: `Too many requests. Retry in ${rl.retryAfterSec}s.` });
  }

  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(10, 'Master password must be at least 10 characters long.'),
    name: z.string().min(2).max(100).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid setup data.' });
  }

  if (!needsInitialBootstrap()) {
    return res.status(409).json({ error: 'Administrator credentials are already configured.' });
  }

  try {
    const owner = bootstrapOwnerPassword(parsed.data.email, parsed.data.password, parsed.data.name);
    logSecurityEvent({
      type: 'admin_bootstrapped',
      email: owner.email,
      role: owner.role,
      severity: 'info',
      message: 'Primary Super Admin master password initialized.',
      maskedIp,
      userAgent: ua,
    });

    const purpose = owner.totpEnabled ? 'login_2fa' : 'setup_2fa';
    const { challengeToken } = createChallenge(owner.id, purpose, maskedIp, ua);
    return res.json({
      requires2fa: owner.totpEnabled,
      requiresSetup2fa: !owner.totpEnabled,
      challengeToken,
      admin: sanitizeAdmin(owner),
    });
  } catch (err: any) {
    return res.status(403).json({ error: err.message || 'Bootstrap declined.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const ip = getClientIp(req);
  const maskedIp = maskIpAddress(ip);
  const ua = req.headers['user-agent'] || '';

  const ipRl = checkRateLimit(`login-ip:${ip}`, 15, 15 * 60 * 1000);
  if (!ipRl.allowed) {
    return res.status(429).json({ error: `Rate limit reached. Try again in ${ipRl.retryAfterSec} seconds.` });
  }

  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Please enter a valid email and password.' });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const admin = getAdminByEmail(email);

  if (!admin) {
    logSecurityEvent({
      type: 'login_failed',
      email,
      severity: 'warning',
      message: 'Login attempt for unknown administrator email.',
      maskedIp,
      userAgent: ua,
    });
    return res.status(401).json({ error: 'Invalid administrator credentials.' });
  }

  if (admin.status !== 'active') {
    logSecurityEvent({
      type: 'login_failed',
      email: admin.email,
      role: admin.role,
      severity: 'critical',
      message: 'Blocked login attempt on revoked administrator account.',
      maskedIp,
      userAgent: ua,
    });
    return res.status(403).json({ error: 'This administrator account has been revoked.' });
  }

  if (admin.lockedUntil && admin.lockedUntil > Date.now()) {
    const minsLeft = Math.ceil((admin.lockedUntil - Date.now()) / 60000);
    return res.status(423).json({
      error: `Account temporarily locked due to repeated failed attempts. Retry in ${minsLeft} minute(s).`,
      lockedUntil: admin.lockedUntil,
    });
  }

  const passwordValid = verifyAdminPassword(admin, parsed.data.password);
  if (!passwordValid) {
    const lockRes = recordFailedLoginAttempt(admin);
    logSecurityEvent({
      type: lockRes.locked ? 'account_locked' : 'login_failed',
      email: admin.email,
      role: admin.role,
      severity: lockRes.locked ? 'critical' : 'warning',
      message: lockRes.locked
        ? 'Account locked for 15 minutes after 5 failed password attempts.'
        : 'Incorrect password submitted during admin sign-in.',
      maskedIp,
      userAgent: ua,
    });
    return res.status(lockRes.locked ? 423 : 401).json({
      error: lockRes.locked
        ? 'Too many failed attempts. Account locked for 15 minutes.'
        : 'Invalid administrator credentials.',
    });
  }

  const purpose = admin.totpEnabled ? 'login_2fa' : 'setup_2fa';
  const { challengeToken } = createChallenge(admin.id, purpose, maskedIp, ua);
  return res.json({
    requires2fa: admin.totpEnabled,
    requiresSetup2fa: !admin.totpEnabled,
    challengeToken,
    admin: sanitizeAdmin(admin),
  });
});

app.post('/api/auth/firebase-verify', async (req, res) => {
  const ip = getClientIp(req);
  const maskedIp = maskIpAddress(ip);
  const ua = req.headers['user-agent'] || '';

  const rl = checkRateLimit(`fb-verify:${ip}`, 15, 15 * 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ error: `Rate limit reached. Retry in ${rl.retryAfterSec}s.` });
  }

  const idToken = typeof req.body?.idToken === 'string' ? req.body.idToken : '';
  if (!idToken) {
    return res.status(400).json({ error: 'Missing Firebase ID token.' });
  }

  try {
    const verifiedToken = await verifyFirebaseIdToken(idToken);
    if (!verifiedToken.emailVerified) {
      return res.status(403).json({ error: 'Verified email address is required for admin access.' });
    }

    const admin = getAdminByEmail(verifiedToken.email);
    if (!admin || admin.status !== 'active') {
      logSecurityEvent({
        type: 'login_failed',
        email: verifiedToken.email,
        severity: 'critical',
        message: 'Unauthorized Google/Firebase sign-in attempt rejected (not in admin allowlist).',
        maskedIp,
        userAgent: ua,
      });
      return res.status(403).json({ error: 'This account is not authorized as a portfolio administrator.' });
    }

    if (admin.lockedUntil && admin.lockedUntil > Date.now()) {
      return res.status(423).json({ error: 'Administrator account is temporarily locked.' });
    }

    const purpose = admin.totpEnabled ? 'login_2fa' : 'setup_2fa';
    const { challengeToken } = createChallenge(admin.id, purpose, maskedIp, ua);
    return res.json({
      requires2fa: admin.totpEnabled,
      requiresSetup2fa: !admin.totpEnabled,
      challengeToken,
      admin: sanitizeAdmin(admin),
    });
  } catch (err: any) {
    logSecurityEvent({
      type: 'login_failed',
      email: 'firebase-token',
      severity: 'warning',
      message: `Firebase token verification failed: ${err.message || 'Invalid token'}`,
      maskedIp,
      userAgent: ua,
    });
    return res.status(401).json({ error: err.message || 'Unable to verify Firebase credential.' });
  }
});

app.post('/api/auth/invite/accept', (req, res) => {
  const ip = getClientIp(req);
  const maskedIp = maskIpAddress(ip);
  const ua = req.headers['user-agent'] || '';

  const schema = z.object({
    inviteToken: z.string().min(10),
    password: z.string().min(10, 'Password must be at least 10 characters long.'),
    name: z.string().min(2).max(100).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid invitation input.' });
  }

  try {
    const admin = acceptInvitation(parsed.data.inviteToken, parsed.data.password, parsed.data.name);
    logSecurityEvent({
      type: 'admin_invite_accepted',
      email: admin.email,
      role: admin.role,
      severity: 'info',
      message: `Administrator accepted invitation (${admin.role}).`,
      maskedIp,
      userAgent: ua,
    });
    const { challengeToken } = createChallenge(admin.id, 'setup_2fa', maskedIp, ua);
    return res.json({
      requiresSetup2fa: true,
      challengeToken,
      admin: sanitizeAdmin(admin),
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Could not accept invitation.' });
  }
});

app.post('/api/auth/2fa/setup', async (req, res) => {
  const challengeToken = typeof req.body?.challengeToken === 'string' ? req.body.challengeToken : '';
  const challenge = getChallengeByToken(challengeToken);
  if (!challenge || challenge.purpose !== 'setup_2fa') {
    return res.status(401).json({ error: 'Invalid or expired 2FA enrollment session. Please sign in again.' });
  }

  const admin = getAdminById(challenge.adminId);
  if (!admin || admin.status !== 'active') {
    return res.status(403).json({ error: 'Administrator account inactive.' });
  }
  if (admin.totpEnabled) {
    return res.status(409).json({ error: 'Google Authenticator is already enabled on this account.' });
  }

  const secret = challenge.pendingSecret || generateTotpSecret(20);
  if (!challenge.pendingSecret) {
    setChallengePendingSecret(challenge.id, secret);
  }

  const otpauthUri = buildOtpAuthUri(admin.email, secret, 'Ash Wickramasinghe Studio');
  const qrDataUrl = await QRCode.toDataURL(otpauthUri, {
    width: 240,
    margin: 2,
    color: { dark: '#0A0D14', light: '#FFFFFF' },
  });

  return res.json({
    qrDataUrl,
    manualSecret: secret,
    otpauthUri,
    accountEmail: admin.email,
  });
});

app.post('/api/auth/2fa/confirm', (req, res) => {
  const ip = getClientIp(req);
  const maskedIp = maskIpAddress(ip);
  const ua = req.headers['user-agent'] || '';

  const rl = checkRateLimit(`2fa-confirm:${ip}`, 15, 10 * 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ error: `Too many verification attempts. Retry in ${rl.retryAfterSec}s.` });
  }

  const challengeToken = typeof req.body?.challengeToken === 'string' ? req.body.challengeToken : '';
  const code = typeof req.body?.code === 'string' ? req.body.code : '';
  const challenge = getChallengeByToken(challengeToken);

  if (!challenge || challenge.purpose !== 'setup_2fa' || !challenge.pendingSecret) {
    return res.status(401).json({ error: 'Enrollment session expired. Please sign in again.' });
  }

  const admin = getAdminById(challenge.adminId);
  if (!admin || admin.status !== 'active') {
    return res.status(403).json({ error: 'Administrator account unavailable.' });
  }

  const check = verifyTotpCode(challenge.pendingSecret, code, -1, 1);
  if (!check.valid || check.matchedStep === undefined) {
    const attempts = incrementChallengeAttempts(challenge.id);
    logSecurityEvent({
      type: 'otp_failed',
      email: admin.email,
      role: admin.role,
      severity: 'warning',
      message: 'Failed initial 2FA setup verification code.',
      maskedIp,
      userAgent: ua,
    });
    return res.status(401).json({
      error: attempts >= 5 ? 'Too many invalid attempts. Please sign in again.' : (check.reason || 'Invalid 6-digit code.'),
    });
  }

  const recoveryCodes = generateRecoveryCodes(10);
  enableAdminTotp(admin.id, challenge.pendingSecret, check.matchedStep, recoveryCodes);
  resetLoginFailures(admin.id);
  consumeChallenge(challenge.id);

  const updatedAdmin = getAdminById(admin.id)!;
  const { sessionToken, session } = createSession(updatedAdmin, maskedIp, ua);
  setSessionCookie(req, res, sessionToken);

  logSecurityEvent({
    type: '2fa_enabled',
    email: updatedAdmin.email,
    role: updatedAdmin.role,
    severity: 'info',
    message: 'Google Authenticator 2FA enabled and recovery codes issued.',
    maskedIp,
    userAgent: ua,
  });

  return res.json({
    sessionToken,
    session: {
      id: session.id,
      browser: session.browser,
      os: session.os,
      deviceType: session.deviceType,
      maskedIp: session.maskedIp,
      createdAt: session.createdAt,
      expiresAt: new Date(session.expiresAt).toISOString(),
    },
    admin: sanitizeAdmin(updatedAdmin),
    recoveryCodes, // Shown once immediately after 2FA enrollment
  });
});

app.post('/api/auth/2fa/verify', (req, res) => {
  const ip = getClientIp(req);
  const maskedIp = maskIpAddress(ip);
  const ua = req.headers['user-agent'] || '';

  const rl = checkRateLimit(`2fa-verify:${ip}`, 15, 10 * 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ error: `Too many OTP attempts. Retry in ${rl.retryAfterSec}s.` });
  }

  const challengeToken = typeof req.body?.challengeToken === 'string' ? req.body.challengeToken : '';
  const code = typeof req.body?.code === 'string' ? req.body.code : '';
  const challenge = getChallengeByToken(challengeToken);

  if (!challenge || challenge.purpose !== 'login_2fa') {
    return res.status(401).json({ error: '2FA challenge expired or invalid. Please sign in again.' });
  }

  const admin = getAdminById(challenge.adminId);
  if (!admin || admin.status !== 'active' || !admin.totpEnabled || !admin.totpSecret) {
    return res.status(403).json({ error: 'Administrator 2FA configuration unavailable.' });
  }

  const check = verifyTotpCode(admin.totpSecret, code, admin.lastTotpStep, 1);
  if (!check.valid || check.matchedStep === undefined) {
    const attempts = incrementChallengeAttempts(challenge.id);
    logSecurityEvent({
      type: 'otp_failed',
      email: admin.email,
      role: admin.role,
      severity: attempts >= 4 ? 'critical' : 'warning',
      message: check.reason || 'Invalid Google Authenticator OTP submitted.',
      maskedIp,
      userAgent: ua,
    });
    return res.status(401).json({
      error: attempts >= 5 ? 'Challenge invalidated after too many invalid codes. Sign in again.' : (check.reason || 'Invalid authenticator code.'),
    });
  }

  updateLastTotpStep(admin.id, check.matchedStep);
  resetLoginFailures(admin.id);
  consumeChallenge(challenge.id);

  const freshAdmin = getAdminById(admin.id)!;
  const { sessionToken, session } = createSession(freshAdmin, maskedIp, ua);
  setSessionCookie(req, res, sessionToken);

  logSecurityEvent({
    type: 'login_success',
    email: freshAdmin.email,
    role: freshAdmin.role,
    severity: 'info',
    message: `Authenticated via Google Authenticator (${session.browser} on ${session.os}).`,
    maskedIp,
    userAgent: ua,
  });

  return res.json({
    sessionToken,
    session: {
      id: session.id,
      browser: session.browser,
      os: session.os,
      deviceType: session.deviceType,
      maskedIp: session.maskedIp,
      createdAt: session.createdAt,
      expiresAt: new Date(session.expiresAt).toISOString(),
    },
    admin: sanitizeAdmin(freshAdmin),
  });
});

app.post('/api/auth/2fa/recovery', (req, res) => {
  const ip = getClientIp(req);
  const maskedIp = maskIpAddress(ip);
  const ua = req.headers['user-agent'] || '';

  const rl = checkRateLimit(`2fa-rec:${ip}`, 10, 15 * 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ error: `Rate limit active. Retry in ${rl.retryAfterSec}s.` });
  }

  const challengeToken = typeof req.body?.challengeToken === 'string' ? req.body.challengeToken : '';
  const recoveryCode = typeof req.body?.recoveryCode === 'string' ? req.body.recoveryCode : '';
  const challenge = getChallengeByToken(challengeToken);

  if (!challenge || challenge.purpose !== 'login_2fa') {
    return res.status(401).json({ error: 'Verification challenge expired. Please sign in again.' });
  }

  const admin = getAdminById(challenge.adminId);
  if (!admin || admin.status !== 'active') {
    return res.status(403).json({ error: 'Administrator account unavailable.' });
  }

  const used = consumeRecoveryCode(admin.id, recoveryCode);
  if (!used) {
    const attempts = incrementChallengeAttempts(challenge.id);
    logSecurityEvent({
      type: 'otp_failed',
      email: admin.email,
      role: admin.role,
      severity: 'critical',
      message: 'Failed backup recovery code verification attempt.',
      maskedIp,
      userAgent: ua,
    });
    return res.status(401).json({
      error: attempts >= 5 ? 'Too many invalid recovery attempts. Sign in again.' : 'Invalid or already used recovery code.',
    });
  }

  resetLoginFailures(admin.id);
  consumeChallenge(challenge.id);

  const freshAdmin = getAdminById(admin.id)!;
  const { sessionToken, session } = createSession(freshAdmin, maskedIp, ua);
  setSessionCookie(req, res, sessionToken);

  logSecurityEvent({
    type: 'recovery_used',
    email: freshAdmin.email,
    role: freshAdmin.role,
    severity: 'warning',
    message: `Single-use 2FA recovery code consumed (${freshAdmin.recoveryCodeHashes.length} remaining).`,
    maskedIp,
    userAgent: ua,
  });

  return res.json({
    sessionToken,
    session: {
      id: session.id,
      browser: session.browser,
      os: session.os,
      deviceType: session.deviceType,
      maskedIp: session.maskedIp,
      createdAt: session.createdAt,
      expiresAt: new Date(session.expiresAt).toISOString(),
    },
    admin: sanitizeAdmin(freshAdmin),
    recoveryCodesRemaining: freshAdmin.recoveryCodeHashes.length,
  });
});

app.get('/api/auth/session', (req, res) => {
  const token = getRequestToken(req);
  const verified = verifySessionToken(token);
  if (!verified || !verified.session.totpVerified) {
    return res.status(401).json({ authenticated: false });
  }
  return res.json({
    authenticated: true,
    session: {
      id: verified.session.id,
      browser: verified.session.browser,
      os: verified.session.os,
      deviceType: verified.session.deviceType,
      maskedIp: verified.session.maskedIp,
      createdAt: verified.session.createdAt,
      lastActiveAt: verified.session.lastActiveAt,
      expiresAt: new Date(verified.session.expiresAt).toISOString(),
    },
    admin: sanitizeAdmin(verified.admin),
  });
});

app.post('/api/auth/logout', requireCsrfSafe, (req, res) => {
  const token = getRequestToken(req);
  const verified = verifySessionToken(token);
  if (verified) {
    revokeSessionById(verified.session.id);
  }
  clearSessionCookie(req, res);
  res.json({ success: true });
});

app.post('/api/auth/password/change', requireCsrfSafe, requireAuth('editor'), (req: AuthenticatedRequest, res) => {
  const ip = getClientIp(req);
  const maskedIp = maskIpAddress(ip);
  const ua = req.headers['user-agent'] || '';

  const schema = z.object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(10, 'New password must be at least 10 characters long.'),
    totpCode: z.string().min(6),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid password payload.' });
  }

  const admin = getAdminById(req.authContext!.adminId);
  if (!admin) return res.status(404).json({ error: 'Account not found.' });

  if (admin.passwordHash && (!parsed.data.currentPassword || !verifyAdminPassword(admin, parsed.data.currentPassword))) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  const stepUp = verifyStepUpOtp(admin.id, parsed.data.totpCode);
  if (!stepUp.ok) {
    return res.status(401).json({ error: stepUp.error });
  }

  updateAdminPassword(admin.id, parsed.data.newPassword);
  revokeOtherSessions(admin.id, req.authContext!.sessionId);

  logSecurityEvent({
    type: 'password_changed',
    email: admin.email,
    role: admin.role,
    severity: 'warning',
    message: 'Administrator password changed and other active sessions revoked.',
    maskedIp,
    userAgent: ua,
  });

  return res.json({ success: true });
});

/* =========================================================================
   AUTHENTICATED & MAGIC-BYTE VERIFIED FILE UPLOAD PIPELINE
   ========================================================================= */

function detectMagicFileType(buffer: Buffer): { safe: boolean; ext?: string; mime?: string; reason?: string } {
  if (buffer.length < 4) {
    return { safe: false, reason: 'Empty or truncated file.' };
  }

  // Block text/script/markup vectors (SVG, HTML, PHP, JS, shell scripts, executables)
  const headText = buffer.subarray(0, Math.min(buffer.length, 512)).toString('utf8').trimStart().toLowerCase();
  if (
    headText.startsWith('<svg') ||
    headText.startsWith('<?xml') ||
    headText.startsWith('<!doctype html') ||
    headText.startsWith('<html') ||
    headText.startsWith('<script') ||
    headText.startsWith('<?php') ||
    headText.startsWith('#!')
  ) {
    return { safe: false, reason: 'Executable scripts, HTML, and active SVG files are blocked for security.' };
  }

  // Windows PE / ELF binaries
  if ((buffer[0] === 0x4d && buffer[1] === 0x5a) || (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46)) {
    return { safe: false, reason: 'Binary executable files are prohibited.' };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { safe: true, ext: 'jpg', mime: 'image/jpeg' };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { safe: true, ext: 'png', mime: 'image/png' };
  }
  // GIF: GIF87a / GIF89a
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return { safe: true, ext: 'gif', mime: 'image/gif' };
  }
  // WebP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { safe: true, ext: 'webp', mime: 'image/webp' };
  }
  // PDF: %PDF-
  if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return { safe: true, ext: 'pdf', mime: 'application/pdf' };
  }
  // DOCX (ZIP): PK\x03\x04
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    return {
      safe: true,
      ext: 'docx',
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
  }
  // Legacy DOC (OLE2): D0 CF 11 E0 A1 B1 1A E1
  if (
    buffer.length >= 8 &&
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0
  ) {
    return { safe: true, ext: 'doc', mime: 'application/msword' };
  }

  return { safe: false, reason: 'Unrecognized file signature. Allowed formats: JPG, PNG, WebP, GIF, PDF, DOC, DOCX.' };
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const rawCategory = typeof req.query.category === 'string' ? req.query.category.toLowerCase() : 'media';
    const subfolder = rawCategory === 'cv' || rawCategory === 'document'
      ? 'cv'
      : rawCategory === 'profile'
        ? 'profile'
        : 'media';
    const targetDir = path.resolve(uploadRoot, subfolder);
    if (!targetDir.startsWith(path.resolve(uploadRoot))) {
      return cb(new Error('Invalid upload directory'), uploadRoot);
    }
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const base = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 48) || 'asset';
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '') || '.bin';
    cb(null, `${timestamp}_${randomSuffix}_${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB secure ceiling
  },
});

const handleFileUpload = (req: AuthenticatedRequest, res: express.Response) => {
  const ip = getClientIp(req);
  const maskedIp = maskIpAddress(ip);
  const ua = req.headers['user-agent'] || '';

  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload failed.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const uploadedPath = path.resolve(req.file.path);
    if (!uploadedPath.startsWith(path.resolve(uploadRoot))) {
      try { fs.unlinkSync(uploadedPath); } catch {}
      return res.status(400).json({ error: 'Invalid upload destination.' });
    }

    // Magic-byte inspection
    try {
      const fd = fs.openSync(uploadedPath, 'r');
      const headerBuf = Buffer.alloc(Math.min(req.file.size, 1024));
      fs.readSync(fd, headerBuf, 0, headerBuf.length, 0);
      fs.closeSync(fd);

      const magic = detectMagicFileType(headerBuf);
      if (!magic.safe || !magic.ext) {
        try { fs.unlinkSync(uploadedPath); } catch {}
        logSecurityEvent({
          type: 'upload_blocked',
          email: req.authContext?.email || 'unknown',
          role: req.authContext?.role,
          severity: 'warning',
          message: `Blocked unsafe upload (${req.file.originalname}): ${magic.reason}`,
          maskedIp,
          userAgent: ua,
        });
        return res.status(400).json({ error: magic.reason || 'Unsupported or unsafe file content.' });
      }

      // Ensure file extension matches verified magic bytes
      let finalFilename = req.file.filename;
      let finalPath = uploadedPath;
      const currentExt = path.extname(finalFilename).toLowerCase().replace('.', '');
      if (currentExt !== magic.ext && !(currentExt === 'jpeg' && magic.ext === 'jpg')) {
        const baseWithoutExt = finalFilename.replace(/\.[^/.]+$/, '');
        finalFilename = `${baseWithoutExt}.${magic.ext}`;
        finalPath = path.resolve(path.dirname(uploadedPath), finalFilename);
        fs.renameSync(uploadedPath, finalPath);
      }

      const rawCategory = typeof req.query.category === 'string'
        ? req.query.category.toLowerCase()
        : (typeof req.query.folder === 'string' ? req.query.folder.toLowerCase() : 'media');

      const subfolder = rawCategory === 'cv' || rawCategory === 'document'
        ? 'cv'
        : rawCategory === 'profile'
          ? 'profile'
          : 'media';

      const relativeUrl = `/uploads/${subfolder}/${finalFilename}`;

      // Mirror file into dist/uploads if dist exists in production
      try {
        const distPath = path.join(process.cwd(), 'dist');
        if (fs.existsSync(distPath)) {
          const distUploadDir = path.join(distPath, 'uploads', subfolder);
          if (!fs.existsSync(distUploadDir)) {
            fs.mkdirSync(distUploadDir, { recursive: true });
          }
          fs.copyFileSync(finalPath, path.join(distUploadDir, finalFilename));
        }
      } catch {
        // non-fatal mirror warning
      }

      return res.json({
        success: true,
        url: relativeUrl,
        filename: finalFilename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: magic.mime || req.file.mimetype,
      });
    } catch (inspectErr: any) {
      try { fs.unlinkSync(uploadedPath); } catch {}
      return res.status(500).json({ error: 'Could not verify uploaded file integrity.' });
    }
  });
};

app.post('/api/upload', requireCsrfSafe, requireAuth('editor'), handleFileUpload);
app.put('/api/upload', requireCsrfSafe, requireAuth('editor'), handleFileUpload);

/* =========================================================================
   SECURITY CENTER, SESSIONS, NOTIFICATIONS & RBAC ADMIN MANAGEMENT
   ========================================================================= */

app.get('/api/security/overview', requireAuth('editor'), (req: AuthenticatedRequest, res) => {
  const ctx = req.authContext!;
  const isPrivileged = ROLE_LEVEL[ctx.role] >= ROLE_LEVEL['admin'];

  const allSessions = listActiveSessions(isPrivileged ? undefined : ctx.adminId).map((s) => ({
    ...s,
    isCurrent: s.id === ctx.sessionId,
  }));

  const events = isPrivileged
    ? listSecurityEvents(200)
    : listSecurityEvents(200).filter((e) => e.email.toLowerCase() === ctx.email.toLowerCase());

  const adminsList = isPrivileged ? listAdmins() : [sanitizeAdmin(getAdminById(ctx.adminId)!)];
  const lockouts = adminsList.filter((a) => a.lockedUntil && a.lockedUntil > Date.now());
  const notifications = listNotifications();

  return res.json({
    currentAdmin: sanitizeAdmin(getAdminById(ctx.adminId)!),
    sessions: allSessions,
    securityEvents: events,
    lockouts,
    notifications,
    unreadNotificationsCount: notifications.filter((n) => !n.read).length,
  });
});

app.post('/api/security/sessions/:id/revoke', requireCsrfSafe, requireAuth('editor'), (req: AuthenticatedRequest, res) => {
  const ctx = req.authContext!;
  const targetId = String(req.params.id || '');
  const sessions = listActiveSessions();
  const target = sessions.find((s) => s.id === targetId);
  if (!target) {
    return res.status(404).json({ error: 'Active session not found.' });
  }
  if (target.adminId !== ctx.adminId && ROLE_LEVEL[ctx.role] < ROLE_LEVEL['admin']) {
    return res.status(403).json({ error: 'Cannot revoke another administrator session.' });
  }

  revokeSessionById(targetId);
  logSecurityEvent({
    type: 'session_revoked',
    email: ctx.email,
    role: ctx.role,
    severity: 'warning',
    message: `Session terminated for ${target.email} (${target.browser} / ${target.maskedIp}).`,
    maskedIp: maskIpAddress(getClientIp(req)),
    userAgent: req.headers['user-agent'] || '',
  });
  return res.json({ success: true });
});

app.post('/api/security/sessions/revoke-others', requireCsrfSafe, requireAuth('editor'), (req: AuthenticatedRequest, res) => {
  const ctx = req.authContext!;
  const count = revokeOtherSessions(ctx.adminId, ctx.sessionId);
  logSecurityEvent({
    type: 'sessions_revoked_all',
    email: ctx.email,
    role: ctx.role,
    severity: 'warning',
    message: `Signed out ${count} other active session(s).`,
    maskedIp: maskIpAddress(getClientIp(req)),
    userAgent: req.headers['user-agent'] || '',
  });
  return res.json({ success: true, revokedCount: count });
});

app.post('/api/security/2fa/regenerate-recovery', requireCsrfSafe, requireAuth('editor'), (req: AuthenticatedRequest, res) => {
  const ctx = req.authContext!;
  const stepUp = verifyStepUpOtp(ctx.adminId, req.body?.totpCode);
  if (!stepUp.ok) {
    return res.status(401).json({ error: stepUp.error });
  }

  const codes = generateRecoveryCodes(10);
  replaceRecoveryCodes(ctx.adminId, codes);
  logSecurityEvent({
    type: 'recovery_regenerated',
    email: ctx.email,
    role: ctx.role,
    severity: 'warning',
    message: 'Generated fresh set of 10 single-use 2FA recovery codes.',
    maskedIp: maskIpAddress(getClientIp(req)),
    userAgent: req.headers['user-agent'] || '',
  });

  return res.json({ recoveryCodes: codes });
});

app.post('/api/security/notifications/read', requireCsrfSafe, requireAuth('editor'), (req, res) => {
  const id = typeof req.body?.id === 'string' ? req.body.id : 'all';
  markNotificationRead(id);
  return res.json({ success: true });
});

// Admin & Role Management
app.get('/api/admins', requireAuth('admin'), (_req, res) => {
  return res.json({
    admins: listAdmins(),
    invitations: listInvitations(),
  });
});

app.post('/api/admins/invite', requireCsrfSafe, requireAuth('admin'), (req: AuthenticatedRequest, res) => {
  const ctx = req.authContext!;
  const schema = z.object({
    email: z.string().email(),
    name: z.string().min(2).max(100),
    role: z.enum(['admin', 'editor']),
    totpCode: z.string().min(6),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid invitation fields.' });
  }

  if (parsed.data.role === 'admin' && ctx.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only the Super Admin can invite full Admin accounts.' });
  }

  const stepUp = verifyStepUpOtp(ctx.adminId, parsed.data.totpCode);
  if (!stepUp.ok) {
    return res.status(401).json({ error: stepUp.error });
  }

  try {
    const { inviteToken, invitation } = createInvitation(
      parsed.data.email,
      parsed.data.name,
      parsed.data.role,
      ctx.email
    );
    logSecurityEvent({
      type: 'admin_invited',
      email: ctx.email,
      role: ctx.role,
      severity: 'info',
      message: `Invited ${invitation.email} as ${invitation.role}.`,
      maskedIp: maskIpAddress(getClientIp(req)),
      userAgent: req.headers['user-agent'] || '',
    });
    return res.json({
      invitation,
      inviteToken,
      invitePath: `/admin/login?invite=${encodeURIComponent(inviteToken)}`,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Could not create invitation.' });
  }
});

app.delete('/api/admins/invite/:id', requireCsrfSafe, requireAuth('admin'), (req, res) => {
  const ok = revokeInvitation(String(req.params.id || ''));
  if (!ok) return res.status(404).json({ error: 'Pending invitation not found.' });
  return res.json({ success: true });
});

app.patch('/api/admins/:id/role', requireCsrfSafe, requireAuth('super_admin'), (req: AuthenticatedRequest, res) => {
  const ctx = req.authContext!;
  const schema = z.object({
    role: z.enum(['admin', 'editor']),
    totpCode: z.string().min(6),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Valid role and 6-digit authenticator code required.' });
  }

  const stepUp = verifyStepUpOtp(ctx.adminId, parsed.data.totpCode);
  if (!stepUp.ok) return res.status(401).json({ error: stepUp.error });

  try {
    const updated = updateAdminRole(String(req.params.id || ''), parsed.data.role);
    logSecurityEvent({
      type: 'admin_role_updated',
      email: ctx.email,
      role: ctx.role,
      severity: 'warning',
      message: `Updated role for ${updated.email} to ${updated.role}.`,
      maskedIp: maskIpAddress(getClientIp(req)),
      userAgent: req.headers['user-agent'] || '',
    });
    return res.json({ admin: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/api/admins/:id/revoke', requireCsrfSafe, requireAuth('admin'), (req: AuthenticatedRequest, res) => {
  const ctx = req.authContext!;
  const targetId = String(req.params.id || '');
  if (targetId === ctx.adminId) {
    return res.status(400).json({ error: 'You cannot revoke your own active session account.' });
  }
  const stepUp = verifyStepUpOtp(ctx.adminId, req.body?.totpCode);
  if (!stepUp.ok) return res.status(401).json({ error: stepUp.error });

  try {
    const updated = revokeAdminAccess(targetId);
    logSecurityEvent({
      type: 'admin_revoked',
      email: ctx.email,
      role: ctx.role,
      severity: 'critical',
      message: `Revoked administrator access for ${updated.email}.`,
      maskedIp: maskIpAddress(getClientIp(req)),
      userAgent: req.headers['user-agent'] || '',
    });
    return res.json({ admin: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/api/admins/:id/restore', requireCsrfSafe, requireAuth('admin'), (req: AuthenticatedRequest, res) => {
  const ctx = req.authContext!;
  const stepUp = verifyStepUpOtp(ctx.adminId, req.body?.totpCode);
  if (!stepUp.ok) return res.status(401).json({ error: stepUp.error });

  try {
    const updated = restoreAdminAccess(String(req.params.id || ''));
    return res.json({ admin: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/api/admins/:id/reset-2fa', requireCsrfSafe, requireAuth('super_admin'), (req: AuthenticatedRequest, res) => {
  const ctx = req.authContext!;
  const stepUp = verifyStepUpOtp(ctx.adminId, req.body?.totpCode);
  if (!stepUp.ok) return res.status(401).json({ error: stepUp.error });

  try {
    const target = getAdminById(String(req.params.id || ''));
    if (!target) return res.status(404).json({ error: 'Administrator not found.' });
    resetAdminTotpForRecovery(target.id);
    logSecurityEvent({
      type: '2fa_reset',
      email: ctx.email,
      role: ctx.role,
      severity: 'critical',
      message: `2FA reset initiated for ${target.email}. Mandatory QR re-enrollment required at next login.`,
      maskedIp: maskIpAddress(getClientIp(req)),
      userAgent: req.headers['user-agent'] || '',
    });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

/* =========================================================================
   PRIVACY-FRIENDLY ANALYTICS & PUBLIC CONTACT PROTECTION
   ========================================================================= */

app.post('/api/analytics/collect', (req, res) => {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`analytics:${ip}`, 90, 60 * 1000);
  if (!rl.allowed) {
    return res.status(204).end();
  }

  const schema = z.object({
    path: z.string().max(150).optional(),
    eventType: z.enum(['page_view', 'project_click', 'article_view', 'contact_submit']).optional(),
    itemId: z.string().max(120).optional(),
    itemTitle: z.string().max(160).optional(),
    category: z.string().max(80).optional(),
    referrerHost: z.string().max(120).optional(),
  });

  const parsed = schema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid telemetry payload.' });
  }

  recordAnalyticsEvent({
    ...parsed.data,
    ip,
    userAgent: req.headers['user-agent'] || '',
  });
  return res.status(204).end();
});

app.get('/api/analytics/summary', requireAuth('editor'), (req, res) => {
  const rawDays = Number(req.query.days) || 30;
  const summary = getAnalyticsSummary(rawDays);

  if (req.query.format === 'csv') {
    const header = 'Date,Page Views,Unique Visitors,Contact Inquiries';
    const rows = summary.timeline.map((row) => `${row.date},${row.views},${row.uniqueVisitors},${row.inquiries}`);
    const csv = [header, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="ash-analytics-${summary.days}d.csv"`);
    return res.send(csv);
  }

  return res.json(summary);
});

app.post('/api/contact', (req, res) => {
  const ip = getClientIp(req);
  const maskedIp = maskIpAddress(ip);
  const ua = req.headers['user-agent'] || '';

  const rl = checkRateLimit(`contact:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ error: `Too many messages sent recently. Please retry in ${rl.retryAfterSec}s.` });
  }

  const schema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(200),
    service: z.string().trim().min(1).max(120).optional(),
    message: z.string().trim().min(10).max(3000),
    website: z.string().max(200).optional(), // Hidden honeypot field
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Please check your inquiry fields.' });
  }

  // Honeypot trap check or excessive link spam check
  const urlMatches = parsed.data.message.match(/https?:\/\//gi) || [];
  if ((parsed.data.website && parsed.data.website.trim().length > 0) || urlMatches.length > 3) {
    logSecurityEvent({
      type: 'contact_spam_blocked',
      email: parsed.data.email,
      severity: 'warning',
      message: 'Automated spam inquiry blocked by honeypot/link heuristic.',
      maskedIp,
      userAgent: ua,
    });
    return res.status(400).json({ error: 'Submission flagged by spam protection.' });
  }

  recordAnalyticsEvent({
    eventType: 'contact_submit',
    ip,
    userAgent: ua,
  });

  addAdminNotification({
    category: 'contact',
    title: `New Inquiry from ${parsed.data.name}`,
    message: `${parsed.data.service || 'General Inquiry'} — ${parsed.data.message.slice(0, 120)}`,
    severity: 'info',
  });

  return res.json({ success: true });
});

/* =========================================================================
   BACKUP INTEGRITY, SYSTEM HEALTH & SEO DISCOVERY ENDPOINTS
   ========================================================================= */

const SECRET_KEY_PATTERN = /(passwordHash|totpSecret|recoveryCodeHashes|tokenHash|pendingSecret|apiKey|privateKey|secret)/i;

function stripSecretsDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripSecretsDeep);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SECRET_KEY_PATTERN.test(k)) continue;
      out[k] = stripSecretsDeep(v);
    }
    return out;
  }
  return value;
}

app.get('/api/backup/history', requireAuth('admin'), (_req, res) => {
  return res.json({ backups: listBackups() });
});

app.post('/api/backup/record-export', requireCsrfSafe, requireAuth('admin'), (req: AuthenticatedRequest, res) => {
  const ctx = req.authContext!;
  const sanitizedSnapshot = stripSecretsDeep(req.body?.snapshot || {}) as Record<string, any>;
  const serialized = JSON.stringify(sanitizedSnapshot, null, 2);
  const checksum = sha256Hex(serialized);

  const counts = {
    projects: Array.isArray(sanitizedSnapshot.projects) ? sanitizedSnapshot.projects.length : 0,
    articles: Array.isArray(sanitizedSnapshot.articles) ? sanitizedSnapshot.articles.length : 0,
    services: Array.isArray(sanitizedSnapshot.siteSettings?.services) ? sanitizedSnapshot.siteSettings.services.length : 0,
    messages: Array.isArray(sanitizedSnapshot.messages) ? sanitizedSnapshot.messages.length : 0,
    media: Array.isArray(sanitizedSnapshot.media) ? sanitizedSnapshot.media.length : 0,
  };

  const entry = recordBackupAction({
    type: 'export',
    actorEmail: ctx.email,
    checksum,
    sizeBytes: Buffer.byteLength(serialized, 'utf8'),
    counts,
    status: 'verified',
  });

  logSecurityEvent({
    type: 'backup_exported',
    email: ctx.email,
    role: ctx.role,
    severity: 'info',
    message: `Exported verified JSON archive (SHA-256 ${checksum.slice(0, 12)}...).`,
    maskedIp: maskIpAddress(getClientIp(req)),
    userAgent: req.headers['user-agent'] || '',
  });

  return res.json({
    record: entry,
    checksum,
    sanitizedSnapshot,
  });
});

app.post('/api/backup/validate-restore', requireCsrfSafe, requireAuth('super_admin'), (req: AuthenticatedRequest, res) => {
  const ctx = req.authContext!;
  const stepUp = verifyStepUpOtp(ctx.adminId, req.body?.totpCode);
  if (!stepUp.ok) return res.status(401).json({ error: stepUp.error });

  const payload = req.body?.bundle as Record<string, any> | undefined;
  if (!payload || typeof payload !== 'object' || !payload.snapshot || typeof payload.snapshot !== 'object') {
    return res.status(400).json({ error: 'Invalid backup archive structure. Expected { snapshot, checksum }.' });
  }

  const sanitizedSnapshot = stripSecretsDeep(payload.snapshot) as Record<string, any>;
  const computedChecksum = sha256Hex(JSON.stringify(sanitizedSnapshot, null, 2));

  if (typeof payload.checksum === 'string' && payload.checksum.trim() && payload.checksum !== computedChecksum) {
    return res.status(400).json({
      error: 'Backup integrity verification failed: SHA-256 checksum mismatch. File may be modified or corrupted.',
    });
  }

  const counts = {
    projects: Array.isArray(sanitizedSnapshot.projects) ? sanitizedSnapshot.projects.length : 0,
    articles: Array.isArray(sanitizedSnapshot.articles) ? sanitizedSnapshot.articles.length : 0,
    services: Array.isArray(sanitizedSnapshot.siteSettings?.services) ? sanitizedSnapshot.siteSettings.services.length : 0,
    messages: Array.isArray(sanitizedSnapshot.messages) ? sanitizedSnapshot.messages.length : 0,
    media: Array.isArray(sanitizedSnapshot.media) ? sanitizedSnapshot.media.length : 0,
  };

  const entry = recordBackupAction({
    type: 'restore',
    actorEmail: ctx.email,
    checksum: computedChecksum,
    sizeBytes: Buffer.byteLength(JSON.stringify(sanitizedSnapshot), 'utf8'),
    counts,
    status: 'verified',
  });

  logSecurityEvent({
    type: 'backup_restored',
    email: ctx.email,
    role: ctx.role,
    severity: 'warning',
    message: `Validated & applied portfolio archive restore (${counts.projects} projects, ${counts.articles} articles).`,
    maskedIp: maskIpAddress(getClientIp(req)),
    userAgent: req.headers['user-agent'] || '',
  });

  return res.json({
    verified: true,
    checksum: computedChecksum,
    record: entry,
    sanitizedSnapshot,
  });
});

app.get('/api/health', (req, res) => {
  const token = getRequestToken(req);
  const verified = verifySessionToken(token);
  const base = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };

  if (!verified) {
    return res.json(base);
  }

  const mem = process.memoryUsage();
  let uploadsWritable = false;
  try {
    fs.accessSync(uploadRoot, fs.constants.W_OK);
    uploadsWritable = true;
  } catch {
    uploadsWritable = false;
  }

  return res.json({
    ...base,
    diagnostics: {
      nodeVersion: process.version,
      uptimeSeconds: Math.round(process.uptime()),
      memoryRssMb: Math.round(mem.rss / 1024 / 1024),
      memoryHeapMb: Math.round(mem.heapUsed / 1024 / 1024),
      uploadsWritable,
      securityVault: 'AES-256-GCM Encrypted',
      totpReplayProtection: 'Active',
      activeSessionsCount: listActiveSessions().length,
      firebaseConfigured: fs.existsSync(path.join(process.cwd(), 'firebase-applet-config.json')),
    },
  });
});

app.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host') || 'ash-wickramasinghe.site'}`;
  res.type('text/plain').send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /dashboard',
      'Disallow: /api/',
      `Sitemap: ${baseUrl.replace(/\/$/, '')}/sitemap.xml`,
    ].join('\n')
  );
});

app.get('/sitemap.xml', (req, res) => {
  const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host') || 'ash-wickramasinghe.site'}`).replace(/\/$/, '');
  const routes = ['/', '/about', '/services', '/projects', '/writing', '/cv', '/contact'];
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes
    .map(
      (route) =>
        `  <url>\n    <loc>${baseUrl}${route}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${route === '/' ? '1.0' : '0.8'}</priority>\n  </url>`
    )
    .join('\n');

  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
  );
});

async function bootstrap() {
  const isDev = process.env.NODE_ENV === 'development';
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (!isDev && hasDist) {
    app.use(express.static(distPath));
    app.use((req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Endpoint not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });

  process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
  });
  process.on('SIGINT', () => {
    server.close(() => process.exit(0));
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
