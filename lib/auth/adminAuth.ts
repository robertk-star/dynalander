// Shared auth helpers for DynLander admin + API protection.
// Uses Web Crypto only so it runs in both Edge middleware and Node route handlers.
// Every check fails closed when the related env var is missing.

export const ADMIN_SESSION_COOKIE = 'dynlander_admin_session';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const encoder = new TextEncoder();

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Hex(value: string) {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

/** Constant-time string comparison (hashes both sides first so length does not leak). */
export async function safeEqual(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b) return false;
  const [ha, hb] = await Promise.all([sha256Hex(a), sha256Hex(b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i += 1) diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i);
  return diff === 0;
}

async function hmacHex(secret: string, data: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(data)));
}

/** Creates a signed session token: "<expiresAtMs>.<hmac>". Returns null if ADMIN_SESSION_SECRET is unset. */
export async function createAdminSessionToken(now = Date.now()) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  const expiresAt = String(now + ADMIN_SESSION_MAX_AGE_SECONDS * 1000);
  const signature = await hmacHex(secret, `admin:${expiresAt}`);
  return `${expiresAt}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | null | undefined, now = Date.now()) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !token) return false;
  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) < now) return false;
  const expected = await hmacHex(secret, `admin:${expiresAt}`);
  return safeEqual(signature, expected);
}

export async function verifyAdminPassword(password: string | null | undefined) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(password, expected);
}

/** x-api-key server-to-server read access for /api/meta-ads/*. */
export async function verifyMetaAdsReadKey(provided: string | null | undefined) {
  const expected = process.env.META_ADS_READ_KEY;
  if (!expected) return false;
  return safeEqual(provided, expected);
}

/** Vercel Cron standard: Authorization: Bearer <CRON_SECRET>. Fails closed when unset. */
export async function verifyCronAuthorization(authorizationHeader: string | null | undefined) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !authorizationHeader) return false;
  return safeEqual(authorizationHeader, `Bearer ${secret}`);
}
