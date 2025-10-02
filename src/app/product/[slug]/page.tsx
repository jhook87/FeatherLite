"use client";

import { useEffect, useState } from 'react';
import { useCart } from '@/components/CartProvider';
import ShadeSwatches, { Shade } from '@/components/ShadeSwatches';
import { imageForSlug, variantImageForSku } from '@/lib/paths';
import ReviewList, { Review } from '@/components/ReviewList';

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
  const { add } = useCart();

  // Fetch product details on mount or slug change
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/products/${slug}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      }
    })();
  }, [slug]);

  // Fetch reviews for this product whenever slug changes
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/reviews?slug=${slug}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    })();
  }, [slug]);

  if (!product) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl border border-border/60 bg-white/70 p-10 text-center text-sm text-muted">
          Loading the details of this ritual favourite…
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

  // Handler for clicking the Buy Now button. Creates a Stripe checkout
  // session and redirects the browser when complete. Falls back to
  // Add to cart behaviour if the API call fails.
  async function handleBuyNow() {
    if (!selectedVariant.shopifyVariantId) {
      console.error('Selected variant is missing a Shopify variant ID.');
      return;
    }
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
    } catch (err) {
      console.error(err);
    }
    // If checkout fails, just add to cart as a fallback
    try {
      await add({ merchandiseId: selectedVariant.shopifyVariantId, quantity: 1 });
    } catch (addErr) {
      console.error(addErr);
    }
  }

  async function handleAddToCart() {
    if (!selectedVariant.shopifyVariantId) {
      console.error('Selected variant is missing a Shopify variant ID.');
      return;
    }
    try {
      await add({ merchandiseId: selectedVariant.shopifyVariantId, quantity: 1 });
    } catch (err) {
      console.error(err);
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
            disabled={!canPurchase}
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add to bag
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!canPurchase}
            className="rounded-full border border-border/70 px-6 py-3 text-sm font-semibold text-text transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            Buy now
          </button>
        </div>

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
          <ReviewList reviews={reviews} />
        </section>
      </div>
    </main>
  );
}