"use client";

import Link from 'next/link';
import ShadeSwatches, { Shade } from './ShadeSwatches';
import { imageForSlug } from '@/lib/paths';

type ProductCardProps = {
  product: any;
  onToggleWishlist?: (slug: string) => void;
  onToggleCompare?: (slug: string) => void;
  wishlistActive?: boolean;
  compareActive?: boolean;
};

/**
 * A card used on the shop page to represent a single product. Updated with a subtle
 * elevation effect, collection chips and highlight bullets so the grid feels more
 * editorial. Shade dots still appear when hex values are available.
*/
export default function ProductCard({
  product,
  onToggleWishlist,
  onToggleCompare,
  wishlistActive,
  compareActive,
}: ProductCardProps) {
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
  const roundedRating = typeof product.averageRating === 'number'
    ? Math.max(0, Math.min(5, Math.round(product.averageRating)))
    : 0;

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-border/60 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute right-3 top-3 flex flex-col gap-2">
        {onToggleWishlist && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleWishlist(product.slug);
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-full border ${
              wishlistActive ? 'border-accent bg-accent/90 text-white' : 'border-border/60 bg-white/90 text-text'
            } shadow-sm transition hover:shadow-md`}
            aria-label={wishlistActive ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {wishlistActive ? '♥' : '♡'}
          </button>
        )}
        {onToggleCompare && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleCompare(product.slug);
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-full border ${
              compareActive ? 'border-text bg-text text-white' : 'border-border/60 bg-white/90 text-text'
            } shadow-sm transition hover:shadow-md`}
            aria-label={compareActive ? 'Remove from comparison' : 'Add to comparison'}
          >
            ⇄
          </button>
        )}
      </div>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={imageForSlug(product.slug)}
            alt={product.name || 'Product image'}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/20 opacity-0 transition duration-500 group-hover:opacity-100" />
        </div>
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted">
            <span>{product.collection?.season ?? 'Signature'}</span>
            {price && (
              <span className="rounded-full bg-highlight/70 px-3 py-1 font-semibold text-text">
                {price}
              </span>
            )}
          </div>
          <div>
            <div className="font-heading text-lg text-text">{product.name}</div>
            <div className="text-sm capitalize text-muted">{product.kind}</div>
          </div>
          {typeof product.averageRating === 'number' && (
            <div className="flex items-center gap-2 text-xs text-accent">
              <span className="font-semibold">{product.averageRating.toFixed(1)}</span>
              <span>{'★'.repeat(roundedRating)}{'☆'.repeat(5 - roundedRating)}</span>
              <span className="text-muted/80">({product.reviewCount ?? 0})</span>
            </div>
          )}
          {shades.length > 0 && (
            <div className="mt-1">
              <ShadeSwatches shades={shades} />
            </div>
          )}
          {product.attributes && (
            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-muted">
              <span className="rounded-full bg-surface/80 px-3 py-1">Finish: {product.attributes.finish}</span>
              <span className="rounded-full bg-surface/80 px-3 py-1">Coverage: {product.attributes.coverage}</span>
            </div>
          )}
          {product.highlights && (
            <ul className="mt-1 space-y-1 text-xs text-muted/80">
              {product.highlights.slice(0, 2).map((point: string) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent/60" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Link>
    </article>
  );
}