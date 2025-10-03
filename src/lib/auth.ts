import { cookies } from 'next/headers';
import { createHmac, createHash, timingSafeEqual } from 'crypto';
import { env } from '@/lib/env';

export const ADMIN_SESSION_COOKIE = 'featherlite.admin';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

type SessionPayload = {
  email: string;
  expires: number;
};

type AdminConfig = {
  email: string;
  passwordHash: string;
  secret: string;
};

export function getAdminConfig(): AdminConfig {
  const email = env.REVIEW_ADMIN_EMAIL?.trim();
  const passwordHash = env.REVIEW_ADMIN_PASSWORD_HASH;
  const secret = env.REVIEW_ADMIN_SECRET;

  if (!email || !passwordHash || !secret) {
    throw new Error('Administrative credentials are not fully configured.');
  }

  return { email, passwordHash, secret };
}

function safeCompare(a: string | undefined | null, b: string | undefined | null) {
  if (!a || !b) return false;
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) {
    return false;
  }
  try {
    return timingSafeEqual(bufferA, bufferB);
  } catch (err) {
    console.error('Failed safe comparison', err);
    return false;
  }
}

export function createSessionToken(email: string, secret: string) {
  const payload: SessionPayload = {
    email,
    expires: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null, secret: string) {
  if (!token) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const expected = createHmac('sha256', secret).update(encoded).digest('base64url');
  if (!safeCompare(signature, expected)) {
    return null;
  }
  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
  } catch (err) {
    console.error('Failed to parse session payload', err);
    return null;
  }
  if (!payload.expires || payload.expires < Date.now()) {
    return null;
  }
  return payload;
}

export function getSessionFromCookies(cookieStore = cookies()) {
  const { secret } = getAdminConfig();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = verifySessionToken(token, secret);
  return session;
}

export function isAdminAuthenticated(cookieStore = cookies()) {
  return Boolean(getSessionFromCookies(cookieStore));
}

export function clearAdminSession(cookieStore = cookies()) {
  const expired = sessionCookieOptions(Date.now() - 60_000);
  cookieStore.set({ ...expired, value: '' });
}

function verifyPassword(password: string, hash: string) {
  if (hash.startsWith('sha256:')) {
    const digest = hash.slice('sha256:'.length);
    if (!digest) {
      return false;
    }
    const hashed = createHash('sha256').update(password).digest('hex');
    return safeCompare(hashed, digest);
  }

  if (hash.startsWith('plain:')) {
    const expected = hash.slice('plain:'.length);
    return safeCompare(password, expected);
  }

  console.error(
    'Unsupported admin password hash format. Expected a value prefixed with "sha256:" or "plain:".'
  );
  return false;
}

export async function authenticateCredentials(email: string, password: string) {
  const { email: adminEmail, passwordHash } = getAdminConfig();
  if (!safeCompare(adminEmail.toLowerCase(), email.toLowerCase())) {
    return false;
  }
  try {
    return verifyPassword(password, passwordHash);
  } catch (error) {
    console.error('Failed to compare password hash', error);
    return false;
  }
}

export function sessionCookieOptions(expires: number) {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true as const,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(expires),
  };
}

export function setAdminSession(email: string, cookieStore = cookies()) {
  const { secret } = getAdminConfig();
  const token = createSessionToken(email, secret);
  const payload = verifySessionToken(token, secret);
  if (!payload) return null;
  const options = sessionCookieOptions(payload.expires);
  cookieStore.set({ ...options, value: token });
  return payload;
}

export function getSessionFromRequest(req: Request) {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) return null;
  const cookiesMap = new Map<string, string>();
  cookieHeader.split(';').forEach((part) => {
    const [name, ...rest] = part.trim().split('=');
    if (!name) return;
    cookiesMap.set(name, rest.join('=') ?? '');
  });
  const token = cookiesMap.get(ADMIN_SESSION_COOKIE);
  const { secret } = getAdminConfig();
  return verifySessionToken(token, secret);
}
