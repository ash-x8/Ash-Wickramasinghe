import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const GOOGLE_CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

let cachedCerts: Record<string, string> = {};
let certsExpiresAt = 0;

function getFirebaseProjectId(): string {
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (parsed.projectId) return String(parsed.projectId);
    }
  } catch {
    // ignore
  }
  return process.env.VITE_FIREBASE_PROJECT_ID || '';
}

async function fetchGooglePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (now < certsExpiresAt && Object.keys(cachedCerts).length > 0) {
    return cachedCerts;
  }

  const res = await fetch(GOOGLE_CERTS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch Google Firebase public keys (${res.status})`);
  }

  const cacheControl = res.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeMs = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) * 1000 : 3600 * 1000;

  const json = (await res.json()) as Record<string, string>;
  cachedCerts = json;
  certsExpiresAt = now + maxAgeMs;
  return cachedCerts;
}

function base64UrlDecode(segment: string): Buffer {
  const pad = segment.length % 4;
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/') + (pad ? '='.repeat(4 - pad) : '');
  return Buffer.from(normalized, 'base64');
}

export interface VerifiedFirebaseToken {
  uid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseToken> {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Missing Firebase ID token');
  }

  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed Firebase ID token');
  }

  const [headerB64, payloadB64, sigB64] = parts;
  const header = JSON.parse(base64UrlDecode(headerB64).toString('utf8'));
  const payload = JSON.parse(base64UrlDecode(payloadB64).toString('utf8'));

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Unsupported Firebase token algorithm');
  }

  const certs = await fetchGooglePublicCerts();
  const certPem = certs[header.kid];
  if (!certPem) {
    throw new Error('Unknown Firebase signing key');
  }

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(`${headerB64}.${payloadB64}`);
  verifier.end();

  const signature = base64UrlDecode(sigB64);
  const signatureValid = verifier.verify(certPem, signature);
  if (!signatureValid) {
    throw new Error('Invalid Firebase ID token signature');
  }

  const projectId = getFirebaseProjectId();
  const nowSec = Math.floor(Date.now() / 1000);

  if (!projectId || payload.aud !== projectId) {
    throw new Error('Firebase token audience mismatch');
  }
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error('Firebase token issuer mismatch');
  }
  if (typeof payload.exp !== 'number' || payload.exp <= nowSec) {
    throw new Error('Firebase token expired');
  }
  if (typeof payload.iat !== 'number' || payload.iat > nowSec + 300) {
    throw new Error('Firebase token issued in the future');
  }
  if (!payload.sub || typeof payload.sub !== 'string') {
    throw new Error('Firebase token missing subject');
  }
  if (!payload.email || typeof payload.email !== 'string') {
    throw new Error('Firebase account has no verified email');
  }

  return {
    uid: payload.sub,
    email: payload.email.toLowerCase(),
    emailVerified: Boolean(payload.email_verified),
    name: typeof payload.name === 'string' ? payload.name : undefined,
  };
}
