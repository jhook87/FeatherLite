// Use the Node.js runtime for this API route and mark it as dynamic. This
// prevents Next.js from attempting to pre-render it during build, which
// would fail without a live database connection. Setting revalidate to 0
// ensures responses are not cached.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * API endpoint that returns a single product by slug. Includes variants,
 * images and collection data. If the product does not exist a 404 is
 * returned.
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      variants: true,
      images: true,
      collection: true,
    },
  });
  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(product);
}