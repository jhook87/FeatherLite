import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * API route for reviews. Returns reviews for a product if a productId is provided via query.
 * For future work, you could support POST to create a new review.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productSlug = searchParams.get('slug');
  if (!productSlug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }
  // Look up product by slug and fetch its reviews
  const product = await prisma.product.findUnique({ where: { slug: productSlug }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  const reviews = await prisma.review.findMany({ where: { productId: product.id }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(reviews);
}

export const dynamic = 'force-dynamic';