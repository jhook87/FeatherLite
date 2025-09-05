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
// --- at top of file (after existing imports) ---
import { z } from 'zod';

const CheckoutItem = z.object({
  sku: z.string().min(1),
  qty: z.number().int().positive(),
});
const CheckoutBody = z.object({
  items: z.array(CheckoutItem).min(1),
});

function normalizeItems(items: Array<{ sku: string; qty: number }>) {
  // merge duplicate SKUs and strip invalids (defense-in-depth, Zod already checked)
  const map = new Map<string, number>();
  for (const { sku, qty } of items) {
    if (!sku || qty <= 0) continue;
    map.set(sku, (map.get(sku) ?? 0) + qty);
  }
  return Array.from(map, ([sku, qty]) => ({ sku, qty }));
}
// --- inside your POST handler, right after reading request json ---
const json = await req.json().catch(() => null);
const parse = CheckoutBody.safeParse(json);
if (!parse.success) {
  return NextResponse.json(
    { error: 'Invalid request body', details: parse.error.flatten() },
    { status: 400 }
  );
}
const items = normalizeItems(parse.data.items);

//  Collect SKUs and fetch variants
const skus = items.map((i) => i.sku);
const variants = await prisma.variant.findMany({
  where: { sku: { in: skus } },
  include: { product: true },
});

//  Validate that every requested SKU exists
if (variants.length !== skus.length) {
  const foundSkus = new Set(variants.map((v) => v.sku));
  const missingSkus = skus.filter((s) => !foundSkus.has(s));
  return NextResponse.json(
    { error: `Invalid SKUs`, missing: missingSkus },
    { status: 400 }
  );
}

//  Build Stripe line items from the *validated* items
const bySku = new Map(variants.map((v) => [v.sku, v]));
const lineItems = items.map(({ sku, qty }) => {
  const v = bySku.get(sku)!; // safe due to validation above
  const name = `${v.product.name} – ${v.name}`;
  return {
    price_data: {
      currency: 'usd',
      product_data: {
        name,
        metadata: { sku: v.sku, productId: v.productId, variantId: v.id },
      },
      unit_amount: v.priceCents,
    },
    quantity: qty,
  };
});

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
