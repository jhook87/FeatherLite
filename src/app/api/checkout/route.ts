// This route must run on Node.js rather than the Edge runtime because it uses
// Prisma and the Shopify SDK, which are not supported in Edge. Mark it as dynamic
// and disable ISR caching to prevent build-time invocation.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDummyVariantBySku } from '@/lib/dummyContent';
import { getShopifyBuyClient, isShopifyStorefrontConfigured } from '@/lib/shopify';

/**
 * Handle POST requests to initiate a Shopify checkout using the Buy SDK. The body
 * should contain an items array with objects specifying sku and qty.
 * Each SKU must match a variant in the database and that variant must have
 * a Shopify variant ID available (populated via the product sync job).
 * When the checkout succeeds the client is redirected to the Shopify hosted
 * checkout page via the returned URL.
 */
export async function POST(req: Request) {
  const { items } = await req.json();
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'No items' }, { status: 400 });
  }
  // Load variants from DB based on provided SKUs
  const skus = items.map((i: any) => i.sku);
  let variantBySku = new Map<string, any>();
  try {
    const variants = await prisma.variant.findMany({
      where: { sku: { in: skus } },
    });
    variantBySku = new Map(variants.map((variant) => [variant.sku, variant]));
  } catch (error) {
    console.warn('Failed to load variants from database for checkout, will use dummy data.', error);
  }
  let lineItems: { variantId: string; quantity: number }[];
  try {
    lineItems = items.map((item: any) => {
      const variant = variantBySku.get(item.sku) ?? getDummyVariantBySku(item.sku)?.variant;
      const qty = Number(item.qty) || 1;
      if (!variant) {
        throw new Error(`Variant with SKU ${item.sku} not found.`);
      }
      if (!variant.shopifyVariantId) {
        throw new Error(`Variant ${variant.sku} is missing a Shopify variant ID.`);
      }
      return {
        variantId: variant.shopifyVariantId,
        quantity: qty,
      };
    });
  } catch (mappingError: any) {
    const message =
      typeof mappingError?.message === 'string'
        ? mappingError.message
        : 'Unable to prepare Shopify checkout.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!isShopifyStorefrontConfigured()) {
    const mockCheckoutId = `mock-checkout-${Date.now()}`;
    const mockUrl = `https://checkout.featherlite.test/${mockCheckoutId}`;
    return NextResponse.json({
      url: mockUrl,
      checkoutId: mockCheckoutId,
      mock: true,
    });
  }

  try {
    const client = getShopifyBuyClient();
    const checkout = await client.checkout.create();
    const updatedCheckout = await client.checkout.addLineItems(checkout.id, lineItems);
    if (!updatedCheckout.webUrl) {
      throw new Error('Shopify checkout did not return a web URL.');
    }
    return NextResponse.json({ url: updatedCheckout.webUrl, checkoutId: updatedCheckout.id });
  } catch (err: any) {
    console.error(err);
    const message = typeof err?.message === 'string' ? err.message : 'Failed to create checkout';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
