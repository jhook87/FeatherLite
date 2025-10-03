"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ProductAttributes } from '@/data/productMeta';

type ComparableProduct = {
  id: string;
  slug: string;
  name: string;
  variants: { priceCents: number }[];
  averageRating?: number | null;
  reviewCount?: number;
  attributes?: ProductAttributes;
  highlights?: string[];
};

type ComparisonDrawerProps = {
  open: boolean;
  onClose: () => void;
  products: ComparableProduct[];
  onRemove: (slug: string) => void;
  onClear: () => void;
};

function formatPrice(product: ComparableProduct) {
  const cents = product.variants?.[0]?.priceCents ?? 0;
  return cents > 0 ? `$${(cents / 100).toFixed(2)}` : '—';
}

export default function ComparisonDrawer({ open, onClose, products, onRemove, onClear }: ComparisonDrawerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const drawerEl = dialogRef.current;
    const focusable = drawerEl
      ? (drawerEl.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        ) ?? [])
      : [];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'Tab' && focusable.length > 0) {
        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            (last || first)?.focus();
          }
        } else if (document.activeElement === last) {
          event.preventDefault();
          (first || last)?.focus();
        }
      }
    };

    const focusTarget = closeButtonRef.current ?? first;
    focusTarget?.focus();

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 px-4 py-6 md:items-center" role="presentation">
      <div
        ref={dialogRef}
        className="w-full max-w-5xl rounded-t-3xl border border-border/60 bg-white/95 p-6 shadow-2xl backdrop-blur md:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="comparison-drawer-heading"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">FeatherLite comparison</p>
            <h2 id="comparison-drawer-heading" className="font-heading text-2xl text-text">
              Side-by-side look
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onClear}
              className="rounded-full border border-border/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text transition hover:border-accent hover:text-accent"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={onClose}
              ref={closeButtonRef}
              className="rounded-full bg-text px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm"
            >
              Close
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-3 pr-4">Attributes</th>
                {products.map((product) => (
                  <th key={product.id} className="py-3 pr-4">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/product/${product.slug}`} className="font-heading text-base text-text hover:text-accent">
                        {product.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => onRemove(product.slug)}
                        className="text-xs uppercase tracking-wide text-muted hover:text-accent"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <tr>
                <th className="py-3 pr-4 text-xs uppercase tracking-wide text-muted">Price</th>
                {products.map((product) => (
                  <td key={`${product.id}-price`} className="py-3 pr-4 text-text">
                    {formatPrice(product)}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="py-3 pr-4 text-xs uppercase tracking-wide text-muted">Finish</th>
                {products.map((product) => (
                  <td key={`${product.id}-finish`} className="py-3 pr-4 text-muted">
                    {product.attributes?.finish ?? 'Feather-light'}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="py-3 pr-4 text-xs uppercase tracking-wide text-muted">Coverage</th>
                {products.map((product) => (
                  <td key={`${product.id}-coverage`} className="py-3 pr-4 text-muted">
                    {product.attributes?.coverage ?? 'Buildable'}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="py-3 pr-4 text-xs uppercase tracking-wide text-muted">Texture</th>
                {products.map((product) => (
                  <td key={`${product.id}-texture`} className="py-3 pr-4 text-muted">
                    {product.attributes?.texture ?? 'Weightless minerals'}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="py-3 pr-4 text-xs uppercase tracking-wide text-muted">Key concerns</th>
                {products.map((product) => (
                  <td key={`${product.id}-concerns`} className="py-3 pr-4 text-muted">
                    {product.attributes?.concerns?.join(', ') ?? 'Universal skin'}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="py-3 pr-4 text-xs uppercase tracking-wide text-muted">Rating</th>
                {products.map((product) => (
                  <td key={`${product.id}-rating`} className="py-3 pr-4 text-accent">
                    {typeof product.averageRating === 'number'
                      ? `${product.averageRating.toFixed(1)} ★ (${product.reviewCount ?? 0})`
                      : 'Awaiting reviews'}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="py-3 pr-4 text-xs uppercase tracking-wide text-muted align-top">Highlights</th>
                {products.map((product) => (
                  <td key={`${product.id}-highlights`} className="py-3 pr-4 text-muted">
                    <ul className="space-y-1">
                      {(product.highlights ?? []).slice(0, 3).map((highlight, index) => (
                        <li key={index}>• {highlight}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
