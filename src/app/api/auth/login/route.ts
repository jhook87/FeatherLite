export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { authenticateCredentials, setAdminSession } from '@/lib/auth';

const WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

type RateLimitEntry = { count: number; expires: number };
const attempts = new Map<string, RateLimitEntry>();

function getClientIdentifier(req: NextRequest) {
  return (
    req.ip ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'anonymous'
  );
}

function isRateLimited(identifier: string) {
  const now = Date.now();
  const entry = attempts.get(identifier);
  if (!entry || entry.expires < now) {
    attempts.set(identifier, { count: 1, expires: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return true;
  }

  attempts.set(identifier, entry);
  return false;
}

type LoginPayload = {
  email: string;
  password: string;
};

function parseLoginPayload(raw: unknown): LoginPayload | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const email = 'email' in raw ? (raw.email as unknown) : undefined;
  const password = 'password' in raw ? (raw.password as unknown) : undefined;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return null;
  }

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return null;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmedEmail)) {
    return null;
  }

  if (!password) {
    return null;
  }

  return { email: trimmedEmail, password };
}

export async function POST(req: NextRequest) {
  const identifier = getClientIdentifier(req);
  if (isRateLimited(identifier)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const payload = parseLoginPayload(raw);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
  }

  const { email, password } = payload;

  try {
    const authenticated = await authenticateCredentials(email, password);
    if (!authenticated) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error('Failed to authenticate admin login attempt', error);
    return NextResponse.json({ error: 'Unable to complete sign in' }, { status: 500 });
  }

  setAdminSession(email);
  return NextResponse.json({ message: 'Signed in' });
}
