// These exports force Next.js to treat this route as a dynamic API endpoint running in the
// Node.js runtime. Without them, Next may attempt to pre-render the route during the
// build process, which fails when the database is unavailable or migrations haven't run.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDummyProducts } from '@/lib/dummyContent';

/**
 * API endpoint that returns a list of all live products. Includes each
 * product's variants and collection information so the shop page can
 * render pricing, filter by season and display variant information.
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { live: true },
      include: { variants: true, collection: { select: { season: true } } },
    });
    if (products.length > 0) {
      return NextResponse.json(products);
    }
  } catch (error) {
    console.warn('Falling back to dummy products because Prisma query failed.', error);
  }

  return NextResponse.json(getDummyProducts());
}