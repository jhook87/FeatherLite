// These exports force Next.js to treat this route as a dynamic API endpoint running in the
// Node.js runtime. Without them, Next may attempt to pre-render the route during the
// build process, which fails when the database is unavailable or migrations haven't run.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { ReviewStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getDummyProducts, getDummyReviews } from '@/lib/dummyContent';

/**
 * API endpoint that returns a list of all live products. Includes each
 * product's variants and collection information so the shop page can
 * render pricing, filter by season and display variant information.
 */
export async function GET() {
  try {
    const [products, aggregates] = await Promise.all([
      prisma.product.findMany({
        where: { live: true },
        include: { variants: true, collection: { select: { season: true } } },
      }),
      prisma.review.groupBy({
        by: ['productId'],
        where: { status: ReviewStatus.APPROVED },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    if (products.length > 0) {
      const summary = new Map(
        aggregates.map((entry) => [entry.productId, { avg: entry._avg.rating ?? 0, count: entry._count.rating }])
      );
      return NextResponse.json(
        products.map((product) => {
          const stats = summary.get(product.id);
          return {
            ...product,
            averageRating: stats ? Number(stats.avg?.toFixed(2)) : null,
            reviewCount: stats?.count ?? 0,
          };
        })
      );
    }
  } catch (error) {
    console.warn('Falling back to dummy products because Prisma query failed.', error);
  }

  const dummyProducts = getDummyProducts().map((product) => {
    const reviews = getDummyReviews(product.slug);
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0 ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(2)) : null;
    return { ...product, averageRating, reviewCount };
  });

  return NextResponse.json(dummyProducts);
}