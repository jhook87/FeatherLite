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
    return <main className="p-8">Loading…</main>;
  }

  const selectedVariant = product.variants[variantIndex];
  const canPurchase = Boolean(selectedVariant.shopifyVariantId);

  // Build array of swatches from all variants that include a hex value
  const swatches: Shade[] = product.variants
    .filter((v) => !!v.hex)
    .map((v) => ({ name: v.name, hex: v.hex! }));

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
    <main className="mx-auto max-w-5xl px-4 py-10 grid md:grid-cols-2 gap-10">
      <div>
        {/* Primary product image. Use variant-specific image when available, otherwise fall back to the product image. */}
        <img
          src={variantImageForSku(selectedVariant.sku) || imageForSlug(product.slug)}
          alt={product.name || 'Product image'}
          className="aspect-square w-full rounded-2xl object-cover"
        />
        {/* Thumbnail gallery showing images for each variant. If a variant does not have its own image,
             fall back to the product image. */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          {product.variants.map((v) => (
            <img
              key={v.sku}
              src={variantImageForSku(v.sku) || imageForSlug(product.slug)}
              alt={`${product.name} – ${v.name}`}
              className="aspect-square w-full rounded-xl object-cover cursor-pointer hover:opacity-80"
              onClick={() => setVariantIndex(product.variants.indexOf(v))}
            />
          ))}
        </div>
      </div>
      <div className="md:sticky md:top-24">
        <h1 className="font-heading text-3xl">{product.name}</h1>
        {product.description && (
          <p className="mt-2 text-gray-700">{product.description}</p>
        )}

        {/* Display swatches if any are defined. */}
        {swatches.length > 0 && (
          <div className="mt-6">
            <div className="text-sm text-gray-600 mb-2">Shades</div>
            <ShadeSwatches shades={swatches} />
          </div>
        )}

        {/* Variant selector */}
        <div className="mt-6">
          <label className="block text-sm text-gray-600 mb-1">Select variant</label>
          <select
            className="border rounded-lg px-3 py-2"
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

        {/* Price and actions */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="text-xl font-heading">
            ${
              (selectedVariant.priceCents / 100).toFixed(2)
            }
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!canPurchase}
            className="rounded-full bg-foreground text-white px-6 py-3 hover:bg-accent transition disabled:opacity-50"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!canPurchase}
            className="rounded-full border px-6 py-3 hover:bg-primary/30 transition disabled:opacity-50"
          >
            Buy Now
          </button>
        </div>

        {/* Ingredients, if provided */}
        {product.ingredients && (
          <div className="mt-8 text-sm text-gray-600">
            Ingredients: {product.ingredients}
          </div>
        )}

        {!canPurchase && (
          <p className="mt-4 text-sm text-red-500">
            This variant is not available for online purchase yet.
          </p>
        )}

        {/* Reviews section */}
        <section className="mt-10">
          <h2 className="font-heading text-2xl mb-4">Customer Reviews</h2>
          <ReviewList reviews={reviews} />
        </section>
      </div>
    </main>
  );
}