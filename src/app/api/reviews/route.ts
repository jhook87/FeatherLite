// Mark this API route as dynamic and running in the Node.js runtime. Reviews are loaded from
// the database at request time. Without these exports, Next.js may attempt to statically
// generate the route during build, which will fail without a database connection.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { ReviewStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getDummyProduct, getDummyReviews } from '@/lib/dummyContent';
import { getSessionFromRequest } from '@/lib/auth';

/**
 * API route for reviews. Returns reviews for a product if a productId is provided via query.
 * For future work, you could support POST to create a new review.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const productSlug = searchParams.get('slug');
  const statusParam = (searchParams.get('status') ?? 'approved').toLowerCase();
  const includeParam = searchParams.getAll('include');
  const includeProduct = includeParam.includes('product');
  const session = getSessionFromRequest(req);
  const isAdmin = Boolean(session);

  const statusMap: Record<string, ReviewStatus> = {
    approved: ReviewStatus.APPROVED,
    pending: ReviewStatus.PENDING,
    rejected: ReviewStatus.REJECTED,
  };

  if (!productSlug && !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requestedStatus = statusParam === 'all' ? null : statusMap[statusParam];
  if (!requestedStatus && statusParam !== 'all') {
    return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
  }

  if (!isAdmin && statusParam !== 'approved') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let productId: string | undefined;
    if (productSlug) {
      const product = await prisma.product.findUnique({ where: { slug: productSlug }, select: { id: true } });
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      productId = product.id;
    }

    const reviews = await prisma.review.findMany({
      where: {
        ...(productId ? { productId } : {}),
        ...(requestedStatus ? { status: requestedStatus } : {}),
      },
      include: includeProduct
        ? {
            product: {
              select: { id: true, name: true, slug: true },
            },
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    if (productSlug) {
      console.warn(`Falling back to dummy reviews for ${productSlug}`, error);
    } else {
      console.warn('Unable to load reviews; returning empty set.', error);
    }
  }

  if (!productSlug) {
    return NextResponse.json([]);
  }

  const dummyProduct = getDummyProduct(productSlug);
  if (!dummyProduct) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json(getDummyReviews(productSlug));
}

export async function POST(req: NextRequest) {
  let payload: { slug?: string; name?: string; rating?: number; comment?: string };
  try {
    payload = (await req.json()) as typeof payload;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const slug = payload.slug?.trim();
  const name = payload.name?.trim();
  const rating = Number(payload.rating);
  const comment = payload.comment?.trim();

  if (!slug || !comment) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: {
        productId: product.id,
        name: name || null,
        rating: Math.round(rating),
        comment,
        status: ReviewStatus.PENDING,
      },
    });

    return NextResponse.json({
      message: 'Review submitted for moderation',
      review: { id: review.id, status: review.status },
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to save review', error);
    return NextResponse.json({ error: 'Unable to save review right now' }, { status: 500 });
  }
}
