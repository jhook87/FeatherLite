export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { shopifyConfig } from '@/lib/shopify';
import { upsertShopifyOrder } from '@/lib/shopifySync';

const SUPPORTED_TOPICS = new Set([
  'orders/create',
  'orders/updated',
  'orders/paid',
  'orders/fulfilled',
]);

function verifySignature(body: string, signature: string) {
  if (!shopifyConfig.webhookSecret) {
    throw new Error('Shopify webhook secret is not configured.');
  }
  if (!signature) {
    return false;
  }
  const digest = createHmac('sha256', shopifyConfig.webhookSecret)
    .update(body, 'utf8')
    .digest();
  const provided = Buffer.from(signature, 'base64');
  if (provided.length !== digest.length) {
    return false;
  }
  return timingSafeEqual(provided, digest);
}

export async function POST(req: Request) {
  const signature = req.headers.get('x-shopify-hmac-sha256') ?? '';
  const topic = req.headers.get('x-shopify-topic') ?? '';
  const body = await req.text();

  try {
    if (!verifySignature(body, signature)) {
      return new NextResponse('Invalid webhook signature', { status: 401 });
    }
  } catch (err: any) {
    console.error('Webhook verification failed', err);
    const message = typeof err?.message === 'string' ? err.message : 'Webhook verification failed';
    return new NextResponse(message, { status: 500 });
  }

  if (!SUPPORTED_TOPICS.has(topic)) {
    return NextResponse.json({ ignored: true });
  }

  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch (err) {
    console.error('Failed to parse webhook payload', err);
    return new NextResponse('Invalid payload', { status: 400 });
  }

  try {
    await upsertShopifyOrder(payload);
  } catch (err: any) {
    console.error('Failed to persist Shopify order', err);
    const message = typeof err?.message === 'string' ? err.message : 'Failed to persist order';
    return new NextResponse(message, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

