export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { authenticateCredentials, setAdminSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  let payload: { email?: string; password?: string };
  try {
    payload = (await req.json()) as typeof payload;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const email = payload.email?.trim();
  const password = payload.password ?? '';
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const authenticated = authenticateCredentials(email, password);
  if (!authenticated) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  setAdminSession(email);
  return NextResponse.json({ message: 'Signed in' });
}
