import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * API endpoint that returns a list of all live products. Includes each
 * product's variants and collection information so the shop page can
 * render pricing, filter by season and display variant information.
 */
export async function GET() {
  const products = await prisma.product.findMany({
    where: { live: true },
    include: { variants: true, collection: { select: { season: true } } },
  });
  return NextResponse.json(products);
}