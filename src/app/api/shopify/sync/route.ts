export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { fetchShopifyProducts } from '@/lib/shopify';
import { syncProducts } from '@/lib/shopifySync';

export async function POST() {
  try {
    const products = await fetchShopifyProducts();
    const synced = await syncProducts(products);
    return NextResponse.json({ synced });
  } catch (err: any) {
    console.error('Failed to sync Shopify products', err);
    const message = typeof err?.message === 'string' ? err.message : 'Failed to sync products';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

