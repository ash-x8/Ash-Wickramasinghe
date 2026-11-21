import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { hashSecretValue, verifySecretValue } from './totp.ts';

export type AdminRole = 'super_admin' | 'admin' | 'editor';

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isPrimaryOwner: boolean;
  passwordHash: string | null;
  totpEnabled: boolean;
  totpSecret: string | null;
  lastTotpStep: number;
  recoveryCodeHashes: string[];
  status: 'active' | 'revoked';
  failedAttempts: number;
  lockedUntil: number | null;
  lastPasswordChangeAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  invitedBy?: string;
}

export interface PublicAdminSummary {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isPrimaryOwner: boolean;
  hasPassword: boolean;
  totpEnabled: boolean;
  recoveryCodesRemaining: number;
  status: 'active' | 'revoked';
  failedAttempts: number;
  lockedUntil: number | null;
  lastPasswordChangeAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminInvitation {
  id: string;
  email: string;
  name: string;
  role: Exclude<AdminRole, 'super_admin'>;
  tokenHash: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: number;
  acceptedAt: string | null;
  revokedAt: string | null;
}

export interface AuthChallenge {
  id: string;
  tokenHash: string;
  adminId: string;
  purpose: 'login_2fa' | 'setup_2fa';
  pendingSecret: string | null;
  attempts: number;
  createdAt: number;
  expiresAt: number;
  maskedIp: string;
  userAgent: string;
}

export interface AdminSession {
  id: string;
  tokenHash: string;
  adminId: string;
  email: string;
  name: string;
  role: AdminRole;
  totpVerified: boolean;
  browser: string;
  os: string;
  deviceType: string;
  maskedIp: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: number;
  revokedAt: string | null;
}

export type SecurityEventType =
  | 'login_success'
  | 'login_failed'
  | 'otp_success'
  | 'otp_failed'
  | 'recovery_used'
  | '2fa_enabled'
  | '2fa_reset'
  | 'recovery_regenerated'
  | 'session_revoked'
  | 'sessions_revoked_all'
  | 'account_locked'
  | 'password_changed'
  | 'admin_bootstrapped'
  | 'admin_invited'
  | 'admin_invite_accepted'
  | 'admin_role_updated'
  | 'admin_revoked'
  | 'backup_exported'
  | 'backup_restored'
  | 'upload_blocked'
  | 'contact_spam_blocked'
  | 'settings_updated';

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  email: string;
  role?: AdminRole;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  maskedIp: string;
  userAgent: string;
  timestamp: string;
}

export interface AdminNotification {
  id: string;
  category: 'security' | 'contact' | 'system' | 'backup';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  createdAt: string;
}

export interface DailyAnalyticsBucket {
  date: string;
  views: number;
  uniqueVisitorHashes: string[];
  paths: Record<string, number>;
  projects: Record<string, { title: string; category: string; clicks: number }>;
  articles: Record<string, { title: string; category: string; views: number }>;
  referrers: Record<string, number>;
  devices: Record<string, number>;
  browsers: Record<string, number>;
  contactSubmissions: number;
}

export interface BackupRecord {
  id: string;
  type: 'export' | 'restore';
  createdAt: string;
  actorEmail: string;
  checksum: string;
  sizeBytes: number;
  counts: {
    projects: number;
    articles: number;
    services: number;
    messages: number;
    media: number;
  };
  status: 'verified' | 'failed';
}

interface VaultData {
  version: number;
  primaryOwnerEmail: string;
  dailySaltDate: string;
  dailySalt: string;
  admins: AdminAccount[];
  invitations: AdminInvitation[];
  challenges: AuthChallenge[];
  sessions: AdminSession[];
  securityEvents: SecurityEvent[];
  notifications: AdminNotification[];
  analytics: Record<string, DailyAnalyticsBucket>;
  backups: BackupRecord[];
}

export const PRIMARY_OWNER_EMAIL = 'kushanashvika216@gmail.com';

const SECURITY_DIR = path.join(process.cwd(), '.security');
const VAULT_FILE = path.join(SECURITY_DIR, 'vault.enc.json');
const KEY_FILE = path.join(SECURITY_DIR, '.master.key');

let runtimeFallbackKey: Buffer | null = null;

function ensureSecurityDir() {
  if (!fs.existsSync(SECURITY_DIR)) {
    fs.mkdirSync(SECURITY_DIR, { recursive: true, mode: 0o700 });
  }
}

function getMasterKey(): Buffer {
  const envKey = process.env.ADMIN_VAULT_KEY || process.env.SESSION_SECRET;
  if (envKey && envKey.trim().length >= 16) {
    return crypto.scryptSync(envKey.trim(), 'ash-portfolio-vault-salt-v1', 32);
  }

  ensureSecurityDir();
  if (fs.existsSync(KEY_FILE)) {
    const hex = fs.readFileSync(KEY_FILE, 'utf8').trim();
    if (/^[0-9a-f]{64}$/i.test(hex)) {
      return Buffer.from(hex, 'hex');
    }
  }

  if (!runtimeFallbackKey) {
    runtimeFallbackKey = crypto.randomBytes(32);
    try {
      fs.writeFileSync(KEY_FILE, runtimeFallbackKey.toString('hex'), { mode: 0o600 });
    } catch {
      // Keep in-memory fallback if read-only fs
    }
  }
  return runtimeFallbackKey;
}

function encryptPayload(plaintext: string): string {
  const key = getMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    v: 1,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64'),
  });
}

function decryptPayload(raw: string): string {
  const parsed = JSON.parse(raw) as { v: number; iv: string; tag: string; data: string };
  const key = getMasterKey();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(parsed.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(parsed.tag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(parsed.data, 'base64')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

function createInitialVault(): VaultData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    version: 1,
    primaryOwnerEmail: PRIMARY_OWNER_EMAIL,
    dailySaltDate: today,
    dailySalt: crypto.randomBytes(16).toString('hex'),
    admins: [
      {
        id: 'admin-owner-primary',
        email: PRIMARY_OWNER_EMAIL,
        name: 'Ash Wickramasinghe',
        role: 'super_admin',
        isPrimaryOwner: true,
        passwordHash: null,
        totpEnabled: false,
        totpSecret: null,
        lastTotpStep: -1,
        recoveryCodeHashes: [],
        status: 'active',
        failedAttempts: 0,
        lockedUntil: null,
        lastPasswordChangeAt: null,
        lastLoginAt: null,
        createdAt: new Date().toISOString(),
      },
    ],
    invitations: [],
    challenges: [],
    sessions: [],
    securityEvents: [],
    notifications: [],
    analytics: {},
    backups: [],
  };
}

let vaultCache: VaultData | null = null;

function loadVault(): VaultData {
  if (vaultCache) return vaultCache;
  ensureSecurityDir();
  if (fs.existsSync(VAULT_FILE)) {
    try {
      const raw = fs.readFileSync(VAULT_FILE, 'utf8');
      const json = decryptPayload(raw);
      vaultCache = JSON.parse(json) as VaultData;
      return vaultCache;
    } catch (err) {
      console.warn('[SecurityStore] Could not decrypt existing vault, initializing fresh encrypted vault.');
    }
  }
  vaultCache = createInitialVault();
  saveVault(vaultCache);
  return vaultCache;
}

function saveVault(data: VaultData): void {
  vaultCache = data;
  try {
    ensureSecurityDir();
    const tmpPath = `${VAULT_FILE}.tmp`;
    fs.writeFileSync(tmpPath, encryptPayload(JSON.stringify(data)), { mode: 0o600 });
    fs.renameSync(tmpPath, VAULT_FILE);
  } catch (err) {
    console.warn('[SecurityStore] Persist note:', err instanceof Error ? err.message : err);
  }
}

export function sha256Hex(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function maskIpAddress(ip: string | undefined): string {
  if (!ip) return '0.0.0.x';
  const clean = ip.replace(/^::ffff:/, '').trim();
  if (clean.includes('.')) {
    const parts = clean.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.x`;
  }
  if (clean.includes(':')) {
    const parts = clean.split(':').filter(Boolean);
    return `${parts.slice(0, 3).join(':')}::x`;
  }
  return 'unknown';
}

export function parseUserAgent(ua: string = ''): { browser: string; os: string; deviceType: string } {
  const lower = ua.toLowerCase();
  let browser = 'Other';
  if (lower.includes('edg/')) browser = 'Edge';
  else if (lower.includes('opr/') || lower.includes('opera')) browser = 'Opera';
  else if (lower.includes('chrome/') || lower.includes('crios/')) browser = 'Chrome';
  else if (lower.includes('firefox/') || lower.includes('fxios/')) browser = 'Firefox';
  else if (lower.includes('safari/') && !lower.includes('chrome')) browser = 'Safari';

  let os = 'Other';
  if (lower.includes('windows')) os = 'Windows';
  else if (lower.includes('mac os') || lower.includes('macintosh')) os = 'macOS';
  else if (lower.includes('android')) os = 'Android';
  else if (lower.includes('iphone') || lower.includes('ipad') || lower.includes('ios')) os = 'iOS';
  else if (lower.includes('linux')) os = 'Linux';

  let deviceType = 'Desktop';
  if (lower.includes('ipad') || lower.includes('tablet')) deviceType = 'Tablet';
  else if (lower.includes('mobile') || lower.includes('iphone') || lower.includes('android')) deviceType = 'Mobile';

  return { browser, os, deviceType };
}

export function sanitizeAdmin(admin: AdminAccount): PublicAdminSummary {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    isPrimaryOwner: admin.isPrimaryOwner,
    hasPassword: Boolean(admin.passwordHash),
    totpEnabled: admin.totpEnabled,
    recoveryCodesRemaining: admin.recoveryCodeHashes.length,
    status: admin.status,
    failedAttempts: admin.failedAttempts,
    lockedUntil: admin.lockedUntil,
    lastPasswordChangeAt: admin.lastPasswordChangeAt,
    lastLoginAt: admin.lastLoginAt,
    createdAt: admin.createdAt,
  };
}

// Sliding window rate limiter
const rateBuckets = new Map<string, number[]>();

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const timestamps = (rateBuckets.get(key) || []).filter((ts) => now - ts < windowMs);
  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    rateBuckets.set(key, timestamps);
    return { allowed: false, retryAfterSec };
  }
  timestamps.push(now);
  rateBuckets.set(key, timestamps);
  return { allowed: true, retryAfterSec: 0 };
}

export function needsInitialBootstrap(): boolean {
  const vault = loadVault();
  const envPass = process.env.ADMIN_PASSCODE?.trim();
  if (envPass && envPass.length >= 8) return false;
  const owner = vault.admins.find((a) => a.isPrimaryOwner);
  return !owner || !owner.passwordHash;
}

export function bootstrapOwnerPassword(email: string, password: string, name?: string): AdminAccount {
  const vault = loadVault();
  const cleanEmail = email.trim().toLowerCase();
  const owner = vault.admins.find((a) => a.isPrimaryOwner);
  if (!owner || cleanEmail !== owner.email.toLowerCase()) {
    throw new Error('Bootstrap is restricted to the primary portfolio owner email.');
  }
  if (owner.passwordHash || (process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim().length >= 8)) {
    throw new Error('Administrator account has already been initialized.');
  }
  owner.passwordHash = hashSecretValue(password);
  if (name && name.trim()) owner.name = name.trim().slice(0, 100);
  owner.lastPasswordChangeAt = new Date().toISOString();
  saveVault(vault);
  return owner;
}

export function getAdminByEmail(email: string): AdminAccount | undefined {
  const vault = loadVault();
  return vault.admins.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
}

export function getAdminById(id: string): AdminAccount | undefined {
  const vault = loadVault();
  return vault.admins.find((a) => a.id === id);
}

export function listAdmins(): PublicAdminSummary[] {
  const vault = loadVault();
  return vault.admins.map(sanitizeAdmin);
}

export function verifyAdminPassword(admin: AdminAccount, password: string): boolean {
  if (admin.isPrimaryOwner && process.env.ADMIN_PASSCODE && process.env.ADMIN_PASSCODE.trim().length >= 8) {
    const envPass = process.env.ADMIN_PASSCODE.trim();
    const a = Buffer.from(password, 'utf8');
    const b = Buffer.from(envPass, 'utf8');
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
      return true;
    }
  }
  if (!admin.passwordHash) return false;
  return verifySecretValue(password, admin.passwordHash);
}

export function recordFailedLoginAttempt(admin: AdminAccount): { locked: boolean; lockedUntil: number | null } {
  const vault = loadVault();
  const target = vault.admins.find((a) => a.id === admin.id);
  if (!target) return { locked: false, lockedUntil: null };
  target.failedAttempts += 1;
  if (target.failedAttempts >= 5) {
    target.lockedUntil = Date.now() + 15 * 60 * 1000;
    saveVault(vault);
    return { locked: true, lockedUntil: target.lockedUntil };
  }
  saveVault(vault);
  return { locked: false, lockedUntil: target.lockedUntil };
}

export function resetLoginFailures(adminId: string): void {
  const vault = loadVault();
  const target = vault.admins.find((a) => a.id === adminId);
  if (!target) return;
  target.failedAttempts = 0;
  target.lockedUntil = null;
  target.lastLoginAt = new Date().toISOString();
  saveVault(vault);
}

export function updateAdminPassword(adminId: string, newPassword: string): void {
  const vault = loadVault();
  const target = vault.admins.find((a) => a.id === adminId);
  if (!target) throw new Error('Administrator not found');
  target.passwordHash = hashSecretValue(newPassword);
  target.lastPasswordChangeAt = new Date().toISOString();
  saveVault(vault);
}

export function createChallenge(
  adminId: string,
  purpose: 'login_2fa' | 'setup_2fa',
  maskedIp: string,
  userAgent: string
): { challengeToken: string; challenge: AuthChallenge } {
  const vault = loadVault();
  const now = Date.now();
  vault.challenges = vault.challenges.filter((c) => c.expiresAt > now);

  const challengeToken = crypto.randomBytes(32).toString('base64url');
  const challenge: AuthChallenge = {
    id: `chg_${crypto.randomUUID()}`,
    tokenHash: sha256Hex(challengeToken),
    adminId,
    purpose,
    pendingSecret: null,
    attempts: 0,
    createdAt: now,
    expiresAt: now + 10 * 60 * 1000,
    maskedIp,
    userAgent,
  };
  vault.challenges.push(challenge);
  saveVault(vault);
  return { challengeToken, challenge };
}

export function getChallengeByToken(token: string): AuthChallenge | undefined {
  const vault = loadVault();
  const now = Date.now();
  const hash = sha256Hex(token);
  const found = vault.challenges.find((c) => c.tokenHash === hash && c.expiresAt > now);
  return found;
}

export function setChallengePendingSecret(challengeId: string, secret: string): void {
  const vault = loadVault();
  const found = vault.challenges.find((c) => c.id === challengeId);
  if (!found) throw new Error('Challenge expired or invalid');
  found.pendingSecret = secret;
  saveVault(vault);
}

export function incrementChallengeAttempts(challengeId: string): number {
  const vault = loadVault();
  const found = vault.challenges.find((c) => c.id === challengeId);
  if (!found) return 999;
  found.attempts += 1;
  if (found.attempts >= 5) {
    vault.challenges = vault.challenges.filter((c) => c.id !== challengeId);
  }
  saveVault(vault);
  return found.attempts;
}

export function consumeChallenge(challengeId: string): void {
  const vault = loadVault();
  vault.challenges = vault.challenges.filter((c) => c.id !== challengeId);
  saveVault(vault);
}

export function enableAdminTotp(
  adminId: string,
  secret: string,
  matchedStep: number,
  recoveryCodes: string[]
): void {
  const vault = loadVault();
  const target = vault.admins.find((a) => a.id === adminId);
  if (!target) throw new Error('Administrator not found');
  target.totpSecret = secret;
  target.totpEnabled = true;
  target.lastTotpStep = matchedStep;
  target.recoveryCodeHashes = recoveryCodes.map((c) => hashSecretValue(c.toUpperCase()));
  saveVault(vault);
}

export function updateLastTotpStep(adminId: string, step: number): void {
  const vault = loadVault();
  const target = vault.admins.find((a) => a.id === adminId);
  if (!target) return;
  target.lastTotpStep = step;
  saveVault(vault);
}

export function consumeRecoveryCode(adminId: string, codeInput: string): boolean {
  const vault = loadVault();
  const target = vault.admins.find((a) => a.id === adminId);
  if (!target) return false;
  const normalized = codeInput.trim().toUpperCase();
  const idx = target.recoveryCodeHashes.findIndex((h) => verifySecretValue(normalized, h));
  if (idx === -1) return false;
  target.recoveryCodeHashes.splice(idx, 1);
  saveVault(vault);
  return true;
}

export function replaceRecoveryCodes(adminId: string, codes: string[]): void {
  const vault = loadVault();
  const target = vault.admins.find((a) => a.id === adminId);
  if (!target) throw new Error('Administrator not found');
  target.recoveryCodeHashes = codes.map((c) => hashSecretValue(c.toUpperCase()));
  saveVault(vault);
}

export function resetAdminTotpForRecovery(adminId: string): void {
  const vault = loadVault();
  const target = vault.admins.find((a) => a.id === adminId);
  if (!target) throw new Error('Administrator not found');
  target.totpEnabled = false;
  target.totpSecret = null;
  target.lastTotpStep = -1;
  target.recoveryCodeHashes = [];
  // Revoke all active sessions for that admin when 2FA is reset
  const nowIso = new Date().toISOString();
  vault.sessions.forEach((s) => {
    if (s.adminId === adminId && !s.revokedAt) {
      s.revokedAt = nowIso;
    }
  });
  saveVault(vault);
}

export function createSession(
  admin: AdminAccount,
  maskedIp: string,
  userAgent: string
): { sessionToken: string; session: AdminSession } {
  const vault = loadVault();
  const now = Date.now();
  // Prune expired/revoked sessions older than 7 days
  vault.sessions = vault.sessions.filter(
    (s) => (!s.revokedAt && s.expiresAt > now) || now - new Date(s.createdAt).getTime() < 7 * 86400 * 1000
  );

  const sessionToken = crypto.randomBytes(32).toString('base64url');
  const parsedUa = parseUserAgent(userAgent);
  const nowIso = new Date(now).toISOString();

  const session: AdminSession = {
    id: `sess_${crypto.randomUUID()}`,
    tokenHash: sha256Hex(sessionToken),
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    totpVerified: true,
    browser: parsedUa.browser,
    os: parsedUa.os,
    deviceType: parsedUa.deviceType,
    maskedIp,
    createdAt: nowIso,
    lastActiveAt: nowIso,
    expiresAt: now + 12 * 60 * 60 * 1000, // 12 hours
    revokedAt: null,
  };

  vault.sessions.push(session);
  saveVault(vault);
  return { sessionToken, session };
}

export function verifySessionToken(token: string): { session: AdminSession; admin: AdminAccount } | null {
  if (!token) return null;
  const vault = loadVault();
  const now = Date.now();
  const hash = sha256Hex(token);
  const session = vault.sessions.find((s) => s.tokenHash === hash && !s.revokedAt && s.expiresAt > now);
  if (!session) return null;
  const admin = vault.admins.find((a) => a.id === session.adminId && a.status === 'active');
  if (!admin) return null;

  // Slide lastActiveAt if > 60s old to avoid excessive disk writes
  if (now - new Date(session.lastActiveAt).getTime() > 60_000) {
    session.lastActiveAt = new Date(now).toISOString();
    session.expiresAt = Math.max(session.expiresAt, now + 12 * 60 * 60 * 1000);
    saveVault(vault);
  }

  return { session, admin };
}

export function listActiveSessions(adminId?: string) {
  const vault = loadVault();
  const now = Date.now();
  return vault.sessions
    .filter((s) => !s.revokedAt && s.expiresAt > now && (!adminId || s.adminId === adminId))
    .map((s) => ({
      id: s.id,
      adminId: s.adminId,
      email: s.email,
      name: s.name,
      role: s.role,
      browser: s.browser,
      os: s.os,
      deviceType: s.deviceType,
      maskedIp: s.maskedIp,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
      expiresAt: new Date(s.expiresAt).toISOString(),
    }));
}

export function revokeSessionById(sessionId: string): boolean {
  const vault = loadVault();
  const target = vault.sessions.find((s) => s.id === sessionId && !s.revokedAt);
  if (!target) return false;
  target.revokedAt = new Date().toISOString();
  saveVault(vault);
  return true;
}

export function revokeOtherSessions(adminId: string, currentSessionId: string): number {
  const vault = loadVault();
  const nowIso = new Date().toISOString();
  let count = 0;
  vault.sessions.forEach((s) => {
    if (s.adminId === adminId && s.id !== currentSessionId && !s.revokedAt) {
      s.revokedAt = nowIso;
      count++;
    }
  });
  saveVault(vault);
  return count;
}

export function revokeAllSessionsForAdmin(adminId: string): number {
  const vault = loadVault();
  const nowIso = new Date().toISOString();
  let count = 0;
  vault.sessions.forEach((s) => {
    if (s.adminId === adminId && !s.revokedAt) {
      s.revokedAt = nowIso;
      count++;
    }
  });
  saveVault(vault);
  return count;
}

// Invitations & RBAC Management
export function createInvitation(
  email: string,
  name: string,
  role: Exclude<AdminRole, 'super_admin'>,
  invitedBy: string
): { inviteToken: string; invitation: Omit<AdminInvitation, 'tokenHash'> } {
  const vault = loadVault();
  const cleanEmail = email.trim().toLowerCase();
  if (vault.admins.some((a) => a.email.toLowerCase() === cleanEmail && a.status === 'active')) {
    throw new Error('An active administrator with this email already exists.');
  }

  const inviteToken = crypto.randomBytes(24).toString('base64url');
  const inv: AdminInvitation = {
    id: `inv_${crypto.randomUUID()}`,
    email: cleanEmail,
    name: name.trim() || cleanEmail.split('@')[0],
    role,
    tokenHash: sha256Hex(inviteToken),
    invitedBy,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + 48 * 60 * 60 * 1000,
    acceptedAt: null,
    revokedAt: null,
  };
  vault.invitations.unshift(inv);
  saveVault(vault);
  const { tokenHash: _, ...publicInv } = inv;
  return { inviteToken, invitation: publicInv };
}

export function listInvitations() {
  const vault = loadVault();
  return vault.invitations.map(({ tokenHash: _, ...rest }) => rest);
}

export function getInvitationByToken(inviteToken: string): AdminInvitation | undefined {
  const vault = loadVault();
  const now = Date.now();
  const hash = sha256Hex(inviteToken);
  return vault.invitations.find(
    (inv) => inv.tokenHash === hash && !inv.acceptedAt && !inv.revokedAt && inv.expiresAt > now
  );
}

export function acceptInvitation(inviteToken: string, password: string, name?: string): AdminAccount {
  const vault = loadVault();
  const now = Date.now();
  const hash = sha256Hex(inviteToken);
  const inv = vault.invitations.find(
    (item) => item.tokenHash === hash && !item.acceptedAt && !item.revokedAt && item.expiresAt > now
  );
  if (!inv) {
    throw new Error('Invitation link is invalid, expired, or already used.');
  }

  let admin = vault.admins.find((a) => a.email.toLowerCase() === inv.email.toLowerCase());
  if (admin) {
    admin.status = 'active';
    admin.role = inv.role;
    admin.name = name?.trim() || inv.name || admin.name;
    admin.passwordHash = hashSecretValue(password);
    admin.lastPasswordChangeAt = new Date().toISOString();
    admin.failedAttempts = 0;
    admin.lockedUntil = null;
  } else {
    admin = {
      id: `adm_${crypto.randomUUID()}`,
      email: inv.email,
      name: name?.trim() || inv.name,
      role: inv.role,
      isPrimaryOwner: false,
      passwordHash: hashSecretValue(password),
      totpEnabled: false,
      totpSecret: null,
      lastTotpStep: -1,
      recoveryCodeHashes: [],
      status: 'active',
      failedAttempts: 0,
      lockedUntil: null,
      lastPasswordChangeAt: new Date().toISOString(),
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      invitedBy: inv.invitedBy,
    };
    vault.admins.push(admin);
  }

  inv.acceptedAt = new Date().toISOString();
  saveVault(vault);
  return admin;
}

export function revokeInvitation(inviteId: string): boolean {
  const vault = loadVault();
  const inv = vault.invitations.find((i) => i.id === inviteId && !i.acceptedAt && !i.revokedAt);
  if (!inv) return false;
  inv.revokedAt = new Date().toISOString();
  saveVault(vault);
  return true;
}

export function updateAdminRole(targetAdminId: string, role: Exclude<AdminRole, 'super_admin'>): PublicAdminSummary {
  const vault = loadVault();
  const target = vault.admins.find((a) => a.id === targetAdminId);
  if (!target) throw new Error('Administrator not found');
  if (target.isPrimaryOwner) throw new Error('Primary Super Admin role cannot be downgraded.');
  target.role = role;
  saveVault(vault);
  return sanitizeAdmin(target);
}

export function revokeAdminAccess(targetAdminId: string): PublicAdminSummary {
  const vault = loadVault();
  const target = vault.admins.find((a) => a.id === targetAdminId);
  if (!target) throw new Error('Administrator not found');
  if (target.isPrimaryOwner) throw new Error('Primary Super Admin account cannot be revoked.');
  target.status = 'revoked';
  const nowIso = new Date().toISOString();
  vault.sessions.forEach((s) => {
    if (s.adminId === targetAdminId && !s.revokedAt) s.revokedAt = nowIso;
  });
  saveVault(vault);
  return sanitizeAdmin(target);
}

export function restoreAdminAccess(targetAdminId: string): PublicAdminSummary {
  const vault = loadVault();
  const target = vault.admins.find((a) => a.id === targetAdminId);
  if (!target) throw new Error('Administrator not found');
  target.status = 'active';
  saveVault(vault);
  return sanitizeAdmin(target);
}

// Security Audit Logging & Notifications
export function logSecurityEvent(entry: Omit<SecurityEvent, 'id' | 'timestamp'>): SecurityEvent {
  const vault = loadVault();
  const evt: SecurityEvent = {
    id: `sec_${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  vault.securityEvents.unshift(evt);
  if (vault.securityEvents.length > 500) {
    vault.securityEvents = vault.securityEvents.slice(0, 500);
  }

  // Generate high-signal admin notifications for important security events
  if (evt.severity === 'critical' || evt.severity === 'warning') {
    vault.notifications.unshift({
      id: `ntf_${crypto.randomUUID()}`,
      category: 'security',
      title: evt.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      message: `${evt.message} (${evt.email})`,
      severity: evt.severity,
      read: false,
      createdAt: evt.timestamp,
    });
    if (vault.notifications.length > 200) {
      vault.notifications = vault.notifications.slice(0, 200);
    }
  }

  saveVault(vault);
  return evt;
}

export function addAdminNotification(input: Omit<AdminNotification, 'id' | 'read' | 'createdAt'>): AdminNotification {
  const vault = loadVault();
  const ntf: AdminNotification = {
    id: `ntf_${crypto.randomUUID()}`,
    read: false,
    createdAt: new Date().toISOString(),
    ...input,
  };
  vault.notifications.unshift(ntf);
  if (vault.notifications.length > 200) {
    vault.notifications = vault.notifications.slice(0, 200);
  }
  saveVault(vault);
  return ntf;
}

export function listSecurityEvents(limit = 150): SecurityEvent[] {
  const vault = loadVault();
  return vault.securityEvents.slice(0, limit);
}

export function listNotifications(): AdminNotification[] {
  const vault = loadVault();
  return vault.notifications;
}

export function markNotificationRead(id: string | 'all'): void {
  const vault = loadVault();
  vault.notifications.forEach((n) => {
    if (id === 'all' || n.id === id) n.read = true;
  });
  saveVault(vault);
}

// Privacy-Friendly Analytics (Zero raw IPs, rotating daily salt)
export function recordAnalyticsEvent(params: {
  path?: string;
  eventType?: 'page_view' | 'project_click' | 'article_view' | 'contact_submit';
  itemId?: string;
  itemTitle?: string;
  category?: string;
  referrerHost?: string;
  ip?: string;
  userAgent?: string;
}) {
  const vault = loadVault();
  const today = new Date().toISOString().slice(0, 10);
  if (vault.dailySaltDate !== today) {
    vault.dailySaltDate = today;
    vault.dailySalt = crypto.randomBytes(16).toString('hex');
  }

  if (!vault.analytics[today]) {
    vault.analytics[today] = {
      date: today,
      views: 0,
      uniqueVisitorHashes: [],
      paths: {},
      projects: {},
      articles: {},
      referrers: {},
      devices: {},
      browsers: {},
      contactSubmissions: 0,
    };
  }

  const bucket = vault.analytics[today];
  const visitorHash = crypto
    .createHmac('sha256', vault.dailySalt)
    .update(`${params.ip || 'anon'}|${params.userAgent || ''}`)
    .digest('hex')
    .slice(0, 16);

  if (!bucket.uniqueVisitorHashes.includes(visitorHash) && bucket.uniqueVisitorHashes.length < 50000) {
    bucket.uniqueVisitorHashes.push(visitorHash);
  }

  const parsedUa = parseUserAgent(params.userAgent);
  const eventType = params.eventType || 'page_view';

  if (eventType === 'page_view') {
    bucket.views += 1;
    const cleanPath = (params.path || '/').slice(0, 120);
    bucket.paths[cleanPath] = (bucket.paths[cleanPath] || 0) + 1;
    bucket.devices[parsedUa.deviceType] = (bucket.devices[parsedUa.deviceType] || 0) + 1;
    bucket.browsers[parsedUa.browser] = (bucket.browsers[parsedUa.browser] || 0) + 1;

    const ref = (params.referrerHost || 'Direct').slice(0, 80);
    bucket.referrers[ref] = (bucket.referrers[ref] || 0) + 1;
  } else if (eventType === 'project_click' && params.itemId) {
    const existing = bucket.projects[params.itemId] || {
      title: (params.itemTitle || params.itemId).slice(0, 120),
      category: (params.category || 'Portfolio').slice(0, 60),
      clicks: 0,
    };
    existing.clicks += 1;
    bucket.projects[params.itemId] = existing;
  } else if (eventType === 'article_view' && params.itemId) {
    const existing = bucket.articles[params.itemId] || {
      title: (params.itemTitle || params.itemId).slice(0, 120),
      category: (params.category || 'Writing').slice(0, 60),
      views: 0,
    };
    existing.views += 1;
    bucket.articles[params.itemId] = existing;
  } else if (eventType === 'contact_submit') {
    bucket.contactSubmissions += 1;
  }

  saveVault(vault);
}

export function getAnalyticsSummary(days: number = 30) {
  const vault = loadVault();
  const safeDays = Math.min(Math.max(days, 1), 365);
  const now = new Date();
  const dateKeys: string[] = [];
  for (let i = safeDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dateKeys.push(d.toISOString().slice(0, 10));
  }

  let totalViews = 0;
  let totalUniqueVisitors = 0;
  let totalContactSubmissions = 0;
  const pagesMap: Record<string, number> = {};
  const projectsMap: Record<string, { id: string; title: string; category: string; clicks: number }> = {};
  const articlesMap: Record<string, { id: string; title: string; category: string; views: number }> = {};
  const referrersMap: Record<string, number> = {};
  const devicesMap: Record<string, number> = {};
  const browsersMap: Record<string, number> = {};

  const timeline = dateKeys.map((dateStr) => {
    const bucket = vault.analytics[dateStr];
    if (!bucket) {
      return {
        date: dateStr,
        views: 0,
        uniqueVisitors: 0,
        inquiries: 0,
      };
    }

    const uniqueCount = bucket.uniqueVisitorHashes.length;
    totalViews += bucket.views;
    totalUniqueVisitors += uniqueCount;
    totalContactSubmissions += bucket.contactSubmissions;

    Object.entries(bucket.paths).forEach(([p, c]) => {
      pagesMap[p] = (pagesMap[p] || 0) + c;
    });
    Object.entries(bucket.projects).forEach(([id, info]) => {
      if (!projectsMap[id]) projectsMap[id] = { id, ...info };
      else projectsMap[id].clicks += info.clicks;
    });
    Object.entries(bucket.articles).forEach(([id, info]) => {
      if (!articlesMap[id]) articlesMap[id] = { id, ...info };
      else articlesMap[id].views += info.views;
    });
    Object.entries(bucket.referrers).forEach(([r, c]) => {
      referrersMap[r] = (referrersMap[r] || 0) + c;
    });
    Object.entries(bucket.devices).forEach(([d, c]) => {
      devicesMap[d] = (devicesMap[d] || 0) + c;
    });
    Object.entries(bucket.browsers).forEach(([b, c]) => {
      browsersMap[b] = (browsersMap[b] || 0) + c;
    });

    return {
      date: dateStr,
      views: bucket.views,
      uniqueVisitors: uniqueCount,
      inquiries: bucket.contactSubmissions,
    };
  });

  // Compute previous period comparison
  const prevKeys: string[] = [];
  for (let i = safeDays * 2 - 1; i >= safeDays; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    prevKeys.push(d.toISOString().slice(0, 10));
  }
  let prevViews = 0;
  let prevUniqueVisitors = 0;
  prevKeys.forEach((k) => {
    const b = vault.analytics[k];
    if (b) {
      prevViews += b.views;
      prevUniqueVisitors += b.uniqueVisitorHashes.length;
    }
  });

  return {
    days: safeDays,
    totals: {
      views: totalViews,
      uniqueVisitors: totalUniqueVisitors,
      contactSubmissions: totalContactSubmissions,
      prevViews,
      prevUniqueVisitors,
    },
    timeline,
    popularPages: Object.entries(pagesMap)
      .map(([pathName, views]) => ({ path: pathName, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10),
    popularProjects: Object.values(projectsMap)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 8),
    popularArticles: Object.values(articlesMap)
      .sort((a, b) => b.views - a.views)
      .slice(0, 8),
    referrers: Object.entries(referrersMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    devices: Object.entries(devicesMap).map(([name, count]) => ({ name, count })),
    browsers: Object.entries(browsersMap).map(([name, count]) => ({ name, count })),
  };
}

export function recordBackupAction(record: Omit<BackupRecord, 'id' | 'createdAt'>): BackupRecord {
  const vault = loadVault();
  const entry: BackupRecord = {
    id: `bkp_${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    ...record,
  };
  vault.backups.unshift(entry);
  if (vault.backups.length > 50) {
    vault.backups = vault.backups.slice(0, 50);
  }
  saveVault(vault);
  return entry;
}

export function listBackups(): BackupRecord[] {
  const vault = loadVault();
  return vault.backups;
}
