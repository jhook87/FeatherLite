export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchShopifyOrders } from '@/lib/shopify';
import { syncOrders } from '@/lib/shopifySync';

export async function GET() {
  try {
    const orders = await fetchShopifyOrders();
    await syncOrders(orders);
    const dbOrders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ orders: dbOrders });
  } catch (err: any) {
    console.error('Failed to fetch Shopify orders', err);
    const message = typeof err?.message === 'string' ? err.message : 'Failed to fetch orders';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

