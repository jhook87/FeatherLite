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
import { getProductMeta } from '@/data/productMeta';

type FilterParams = {
  query?: string;
  category?: string;
  season?: string;
  finish?: string;
  coverage?: string;
  concern?: string;
  sort?: string;
};

function normaliseFilters(url: URL): FilterParams {
  const params = Object.fromEntries(url.searchParams.entries());
  return {
    query: params.query?.trim() || undefined,
    category: params.category?.trim().toLowerCase() || undefined,
    season: params.season?.trim() || undefined,
    finish: params.finish?.trim().toLowerCase() || undefined,
    coverage: params.coverage?.trim().toLowerCase() || undefined,
    concern: params.concern?.trim().toLowerCase() || undefined,
    sort: params.sort?.trim().toLowerCase() || undefined,
  };
}

function enrichWithMeta(product: any) {
  const attributes = getProductMeta(product.slug);
  return {
    ...product,
    attributes,
    popularityScore: attributes?.popularityScore ?? product.popularityScore ?? 0,
  };
}

function applyFilters(products: any[], filters: FilterParams) {
  let list = [...products];

  if (filters.query) {
    const queryLower = filters.query.toLowerCase();
    list = list.filter((product) => product.name.toLowerCase().includes(queryLower));
  }

  if (filters.category) {
    list = list.filter((product) => product.kind.toLowerCase() === filters.category);
  }

  if (filters.season) {
    list = list.filter((product) => product.collection?.season === filters.season);
  }

  if (filters.finish) {
    list = list.filter((product) => product.attributes?.finish?.toLowerCase() === filters.finish);
  }

  if (filters.coverage) {
    list = list.filter((product) => product.attributes?.coverage?.toLowerCase() === filters.coverage);
  }

  if (filters.concern) {
    list = list.filter((product) => {
      const concerns = product.attributes?.concerns?.map((value: string) => value.toLowerCase()) ?? [];
      return concerns.includes(filters.concern!);
    });
  }

  const getPrice = (product: any) => product.variants?.[0]?.priceCents ?? 0;

  switch (filters.sort) {
    case 'price-asc':
      list.sort((a, b) => getPrice(a) - getPrice(b));
      break;
    case 'price-desc':
      list.sort((a, b) => getPrice(b) - getPrice(a));
      break;
    case 'rating':
      list.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
      break;
    case 'popularity':
      list.sort((a, b) => {
        const aScore = (a.popularityScore ?? 0) + (a.reviewCount ?? 0) * 2;
        const bScore = (b.popularityScore ?? 0) + (b.reviewCount ?? 0) * 2;
        return bScore - aScore;
      });
      break;
    default:
      break;
  }

  return list;
}

/**
 * API endpoint that returns a list of all live products. Includes each
 * product's variants and collection information so the shop page can
 * render pricing, filter by season and display variant information.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = normaliseFilters(url);

  try {
    const [products, aggregates] = await Promise.all([
      prisma.product.findMany({
        where: {
          live: true,
          ...(filters.query
            ? {
                name: { contains: filters.query, mode: 'insensitive' },
              }
            : {}),
          ...(filters.category
            ? {
                kind: filters.category,
              }
            : {}),
          ...(filters.season
            ? {
                collection: { season: filters.season },
              }
            : {}),
        },
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
      const mapped = products.map((product) => {
        const stats = summary.get(product.id);
        return enrichWithMeta({
          ...product,
          averageRating: stats ? Number(stats.avg?.toFixed(2)) : null,
          reviewCount: stats?.count ?? 0,
        });
      });

      const filtered = applyFilters(mapped, filters);

      return NextResponse.json({
        items: filtered,
        total: mapped.length,
      });
    }
  } catch (error) {
    console.warn('Falling back to dummy products because Prisma query failed.', error);
  }

  const dummyProducts = getDummyProducts().map((product) => {
    const reviews = getDummyReviews(product.slug);
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0 ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(2)) : null;
    return enrichWithMeta({ ...product, averageRating, reviewCount });
  });

  const filtered = applyFilters(dummyProducts, filters);

  return NextResponse.json({
    items: filtered,
    total: dummyProducts.length,
  });
}