"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from '@/components/CartProvider';
import ShadeSwatches, { Shade } from '@/components/ShadeSwatches';
import { imageForSlug, variantImageForSku } from '@/lib/paths';
import ReviewList, { Review } from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';
import { getDummyProducts, getDummyReviews } from '@/lib/dummyContent';

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  priceCents: number;
  hex?: string | null;
  shopifyVariantId?: string | null;
}

interface Product {
  slug: string;
  name: string;
  description?: string | null;
  kind: string;
  ingredients?: string | null;
  variants: ProductVariant[];
  highlights?: string[];
  averageRating?: number | null;
  reviewCount?: number;
}

/**
 * Page showing details for an individual product. Supports variant
 * selection, displays swatches and reviews, and allows the user to add
 * the selected variant to the cart or proceed directly to Stripe checkout.
 */
export default function ProductDetail({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [variantIndex, setVariantIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');
  const { add } = useCart();
  const actionErrorRef = useRef<HTMLParagraphElement>(null);

  const fallbackProduct = useMemo(() => {
    const dummy = getDummyProducts().find((item) => item.slug === slug);
    if (!dummy) return null;
    const dummyReviews = getDummyReviews(slug);
    const reviewCount = dummyReviews.length;
    const averageRating =
      reviewCount > 0 ? dummyReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : null;
    return {
      ...dummy,
      averageRating,
      reviewCount,
    } as Product;
  }, [slug]);

  const fallbackReviews = useMemo(() => {
    return getDummyReviews(slug).map((review) => ({
      id: review.id,
      name: review.name,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    }));
  }, [slug]);

  useEffect(() => {
    setOrigin(typeof window !== 'undefined' ? window.location.origin : '');
  }, []);

  // Fetch product details on mount or slug change
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetch(`/api/products/${slug}`, { cache: 'no-store', signal: controller.signal });
        if (!res.ok) {
          throw new Error('Unable to load product details.');
        }
        const data = (await res.json()) as Product;
        if (!active) return;
        setProduct(data);
      } catch (err) {
        if (!active) return;
        console.error('Failed to load product details', err);
        if (fallbackProduct) {
          setProduct(fallbackProduct);
          setError('Showing studio sample while we refresh live product data.');
        } else {
          setProduct(null);
          setError('We are unable to load this ritual favourite right now. Please try again soon.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [slug, fallbackProduct]);

  // Fetch reviews for this product whenever slug changes
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setReviewsLoading(true);
    setReviewsError(null);

    (async () => {
      try {
        const res = await fetch(`/api/reviews?slug=${slug}`, { cache: 'no-store', signal: controller.signal });
        if (!res.ok) {
          throw new Error('Unable to load customer reflections.');
        }
        const data = (await res.json()) as Review[];
        if (!active) return;
        setReviews(data);
      } catch (err) {
        if (!active) return;
        console.error('Failed to load reviews', err);
        setReviews(fallbackReviews);
        setReviewsError('Displaying studio testimonials while we fetch new stories.');
      } finally {
        if (active) {
          setReviewsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [slug, fallbackReviews]);

  useEffect(() => {
    setVariantIndex(0);
  }, [product?.id]);

  useEffect(() => {
    if (actionError && actionErrorRef.current) {
      actionErrorRef.current.focus();
    }
  }, [actionError]);

  if (!product && loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl border border-border/60 bg-white/70 p-10 text-center text-sm text-muted" role="status">
          Loading the details of this ritual favourite…
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl border border-border/60 bg-white/70 p-10 text-center text-sm text-muted" role="alert">
          {error ?? "We couldn't find this product."}
        </div>
      </main>
    );
  }

  const selectedVariant = product.variants[variantIndex];
  const canPurchase = Boolean(selectedVariant.shopifyVariantId);

  // Build array of swatches from all variants that include a hex value
  const swatches: Shade[] = product.variants
    .filter((v) => !!v.hex)
    .map((v) => ({ name: v.name, hex: v.hex! }));
  const highlights = Array.isArray((product as any).highlights)
    ? ((product as any).highlights as string[])
    : [];
  const ingredients = product.ingredients
    ? product.ingredients.split(',').map((item) => item.trim()).filter(Boolean)
    : [];

  const structuredData = useMemo(() => {
    if (!product) return null;
    const imagePath = variantImageForSku(selectedVariant.sku) || imageForSlug(product.slug);
    const absoluteImage = origin ? new URL(imagePath, origin).toString() : imagePath;
    const ratingCount = reviews.length || product.reviewCount || 0;
    const averageRating = ratingCount
      ? reviews.length
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : product.averageRating ?? null
      : null;

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description ?? undefined,
      image: absoluteImage,
      sku: selectedVariant.sku,
      brand: {
        '@type': 'Brand',
        name: 'FeatherLite Cosmetics',
      },
      offers: product.variants.map((variant) => ({
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: Number((variant.priceCents / 100).toFixed(2)),
        availability: variant.shopifyVariantId ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        sku: variant.sku,
        url: origin ? `${origin}/product/${product.slug}` : undefined,
      })),
      ...(averageRating
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: Number(averageRating.toFixed(1)),
              reviewCount: ratingCount,
            },
          }
        : {}),
      review: reviews.map((review) => ({
        '@type': 'Review',
        reviewBody: review.comment,
        datePublished: review.createdAt,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
        },
        author: {
          '@type': 'Person',
          name: review.name ?? 'Anonymous',
        },
      })),
    };
  }, [product, selectedVariant, reviews, origin]);

  // Handler for clicking the Buy Now button. Creates a Stripe checkout
  // session and redirects the browser when complete. Falls back to
  // Add to cart behaviour if the API call fails.
  async function handleBuyNow() {
    if (!selectedVariant.shopifyVariantId) {
      setActionError('Selected variant is not yet available for purchase.');
      return;
    }
    setIsSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items: [{ sku: selectedVariant.sku, qty: 1 }] }),
      });
      const data = await res.json();
      if (res.ok && data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error('Checkout session did not return a redirect URL.');
    } catch (err) {
      console.error(err);
      try {
        await add({ merchandiseId: selectedVariant.shopifyVariantId, quantity: 1 });
        setActionError('We added this shade to your bag instead while checkout gets ready.');
      } catch (addErr) {
        console.error(addErr);
        setActionError('We could not start checkout right now. Please try again in a moment.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddToCart() {
    if (!selectedVariant.shopifyVariantId) {
      setActionError('Selected variant is not yet available for purchase.');
      return;
    }
    setIsSubmitting(true);
    setActionError(null);
    try {
      await add({ merchandiseId: selectedVariant.shopifyVariantId, quantity: 1 });
    } catch (err) {
      console.error(err);
      setActionError('Unable to add this shade to your bag. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl grid gap-12 px-4 pb-20 pt-12 md:grid-cols-[1.1fr_1fr]">
      <div className="space-y-4">
        <div className="rounded-[3rem] border border-border/60 bg-white/80 p-6 shadow-lg">
          <img
            src={variantImageForSku(selectedVariant.sku) || imageForSlug(product.slug)}
            alt={product.name || 'Product image'}
            className="aspect-square w-full rounded-[2rem] object-cover"
          />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {product.variants.map((v, idx) => (
            <button
              key={v.sku}
              type="button"
              onClick={() => setVariantIndex(idx)}
              className={`overflow-hidden rounded-2xl border ${
                idx === variantIndex ? 'border-accent ring-2 ring-accent/40' : 'border-border/60'
              }`}
            >
              <img
                src={variantImageForSku(v.sku) || imageForSlug(product.slug)}
                alt={`${product.name} – ${v.name}`}
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-6 rounded-[3rem] border border-border/60 bg-white/80 p-8 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wide text-muted">{product.kind}</p>
          <h1 className="font-heading text-3xl text-text">{product.name}</h1>
          {product.description && (
            <p className="text-sm leading-relaxed text-muted">{product.description}</p>
          )}
        </div>

        {error && (
          <p className="rounded-2xl border border-border/60 bg-highlight/60 px-4 py-3 text-sm text-text" role="status">
            {error}
          </p>
        )}

        {swatches.length > 0 && (
          <div>
            <span className="text-xs uppercase tracking-wide text-muted">Shades</span>
            <ShadeSwatches shades={swatches} />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-muted">Select shade</label>
          <select
            className="w-full rounded-full border border-border/60 bg-white/90 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            value={variantIndex}
            onChange={(e) => setVariantIndex(parseInt(e.target.value, 10))}
          >
            {product.variants.map((v, i) => (
              <option key={v.id} value={i}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="text-2xl font-heading text-text">
            ${(selectedVariant.priceCents / 100).toFixed(2)}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!canPurchase || isSubmitting}
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Adding…' : 'Add to bag'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!canPurchase || isSubmitting}
            className="rounded-full border border-border/70 px-6 py-3 text-sm font-semibold text-text transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Please wait…' : 'Buy now'}
          </button>
        </div>

        {actionError && (
          <p
            ref={actionErrorRef}
            tabIndex={-1}
            role="alert"
            className="rounded-2xl border border-border/60 bg-highlight/60 px-4 py-3 text-sm text-text"
          >
            {actionError}
          </p>
        )}

        {highlights.length > 0 && (
          <div className="rounded-2xl border border-border/60 bg-white/70 p-5 text-sm text-muted">
            <p className="text-xs uppercase tracking-wide text-muted">Why we love it</p>
            <ul className="mt-3 space-y-2">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent/60" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {ingredients.length > 0 && (
          <div className="rounded-2xl border border-border/60 bg-white/70 p-5 text-sm text-muted">
            <p className="text-xs uppercase tracking-wide text-muted">Ingredients</p>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ingredients.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {!canPurchase && (
          <p className="rounded-2xl border border-border/60 bg-highlight/60 px-4 py-3 text-sm text-text">
            This variant is not available for online purchase yet. Reach out to our concierge team for assistance.
          </p>
        )}

        <section>
          <h2 className="font-heading text-2xl text-text">Customer reviews</h2>
          {reviewsError && (
            <p className="mt-2 rounded-2xl border border-border/60 bg-white/70 px-4 py-2 text-sm text-muted" role="status">
              {reviewsError}
            </p>
          )}
          {reviewsLoading ? (
            <p className="mt-4 text-sm text-muted" role="status">
              Gathering the latest stories…
            </p>
          ) : (
            <ReviewList reviews={reviews} />
          )}
          <ReviewForm productSlug={slug} />
        </section>
      </div>
      {structuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      )}
    </main>
  );
}
