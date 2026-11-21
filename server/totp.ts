import crypto from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

export function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) {
      throw new Error('Invalid Base32 character in TOTP secret');
    }
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

export function generateTotpSecret(byteLength = 20): string {
  return base32Encode(crypto.randomBytes(byteLength));
}

export function buildOtpAuthUri(email: string, secret: string, issuer = 'Ash Wickramasinghe'): string {
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(email)}`;
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

export function generateTotpCode(secret: string, timeStep: number): string {
  const key = base32Decode(secret);
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(timeStep), 0);

  const hmac = crypto.createHmac('sha1', key).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(code % 1_000_000).padStart(6, '0');
}

export function getCurrentTimeStep(periodSeconds = 30): number {
  return Math.floor(Date.now() / 1000 / periodSeconds);
}

export function verifyTotpCode(
  secret: string,
  candidate: string,
  lastVerifiedStep: number = -1,
  window = 1
): { valid: boolean; matchedStep?: number; reason?: string } {
  const cleanCode = candidate.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanCode)) {
    return { valid: false, reason: 'Invalid 6-digit code format' };
  }

  const currentStep = getCurrentTimeStep(30);
  const candidateBuf = Buffer.from(cleanCode, 'utf8');

  for (let offset = -window; offset <= window; offset++) {
    const step = currentStep + offset;
    if (step < 0) continue;

    const expected = generateTotpCode(secret, step);
    const expectedBuf = Buffer.from(expected, 'utf8');

    if (
      candidateBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(candidateBuf, expectedBuf)
    ) {
      // Replay protection: never accept a code from a previously consumed time-step
      if (step <= lastVerifiedStep) {
        return { valid: false, reason: 'OTP code already used. Wait for the next 30-second code.' };
      }
      return { valid: true, matchedStep: step };
    }
  }

  return { valid: false, reason: 'Invalid authenticator code' };
}

export function generateRecoveryCodes(count = 10): string[] {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const bytes = crypto.randomBytes(12);
    let raw = '';
    for (let j = 0; j < 12; j++) {
      raw += chars[bytes[j] % chars.length];
    }
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`);
  }

  return codes;
}

export function hashSecretValue(value: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(value, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifySecretValue(value: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, hashHex] = parts;
  if (!salt || !hashHex) return false;

  const derived = crypto.scryptSync(value, salt, 64);
  const expected = Buffer.from(hashHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}
