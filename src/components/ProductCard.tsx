"use client";

import Link from 'next/link';
import ShadeSwatches, { Shade } from './ShadeSwatches';

/**
 * A card used on the shop page to represent a single product. Displays
 * a placeholder image, the product name, kind and price. If shade
 * information is available on the product's variants a row of small
 * coloured dots will render below the kind. Clicking the card navigates
 * to the product detail page.
 */
export default function ProductCard({ product }: { product: any }) {
  // Compute the display price from the first variant. The API returns
  // priceCents as an integer number of cents.
  const firstVariant = product.variants?.[0];
  const price =
    firstVariant && typeof firstVariant.priceCents === 'number'
      ? `$${(firstVariant.priceCents / 100).toFixed(2)}`
      : '';

  // Build an array of shades for variants that expose a hex value. Only
  // include the first eight to avoid overcrowding the card UI.
  const shades: Shade[] = Array.isArray(product.variants)
    ? product.variants
        .filter((v: any) => v.hex)
        .slice(0, 8)
        .map((v: any) => ({ name: v.name, hex: v.hex }))
    : [];

  return (
    <Link
      href={`/product/${product.slug}`}
      className="block border rounded-2xl overflow-hidden bg-white hover:shadow-md transition"
    >
      {/* Placeholder image. Replace with real product imagery via the public folder when available. */}
      <div className="aspect-square bg-gray-100" />
      <div className="p-4">
        <div className="font-heading">{product.name}</div>
        <div className="text-sm text-gray-600 capitalize">{product.kind}</div>
        {shades.length > 0 && <ShadeSwatches shades={shades} />}
        {price && <div className="mt-2 text-sm">{price}</div>}
      </div>
    </Link>
  );
}