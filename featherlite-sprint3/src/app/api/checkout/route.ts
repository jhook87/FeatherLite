// This route must run on Node.js rather than the Edge runtime because it uses
// Prisma and Stripe, which are not supported in Edge. Mark it as dynamic
// and disable ISR caching to prevent build-time invocation.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

/**
 * Handle POST requests to initiate a Stripe Checkout session. The body
 * should contain an items array with objects specifying sku and qty.
 * Each SKU must match a variant in the database. When the session
 * creation succeeds the client is redirected to the Stripe hosted
 * checkout page via the returned URL.
 */
export async function POST(req: Request) {
  const { items } = await req.json();
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'No items' }, { status: 400 });
  }
  // Load variants from DB based on provided SKUs
  const skus = items.map((i: any) => i.sku);
  const variants = await prisma.variant.findMany({
    where: { sku: { in: skus } },
    include: { product: true },
  });
  // Build line items for Stripe
  const line_items = variants.map((v) => {
    const qty = items.find((i: any) => i.sku === v.sku)?.qty ?? 1;
    return {
      quantity: qty,
      price_data: {
        currency: 'usd',
        unit_amount: v.priceCents,
        product_data: {
          name: `${v.product.name} – ${v.name}`,
        },
      },
    };
  });
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: `${base}/success`,
      cancel_url: `${base}/cancel`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}