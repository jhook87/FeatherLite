"use client";

import { useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { variantImageForSku } from '@/lib/paths';

/**
 * Cart page displays the contents of the user's shopping cart. It
 * summarises each item with its SKU, name and quantity. Users can
 * proceed directly to checkout or clear the cart. The cart is backed
 * by Shopify's Storefront API so the quantities and pricing remain in
 * sync with the store. Pricing is displayed using the currency returned
 * from Shopify.
 */
export default function CartPage() {
  const { items, clear, updateQty, remove, checkoutUrl, currencyCode, subtotalCents, refresh } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (items.length === 0) return;
    if (!checkoutUrl) {
      setError('Checkout URL is unavailable. Please try refreshing your cart.');
      return;
    }
    setLoading(true);
    setError(null);
    window.location.href = checkoutUrl;
  }

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
    }).format((cents || 0) / 100);

  async function handleQuantityChange(id: string, quantity: number) {
    setError(null);
    try {
      await updateQty(id, quantity);
    } catch (err: any) {
      console.error(err);
      setError(typeof err?.message === 'string' ? err.message : 'Unable to update quantity');
    }
  }

  async function handleRemove(id: string) {
    setError(null);
    try {
      await remove(id);
    } catch (err: any) {
      console.error(err);
      setError(typeof err?.message === 'string' ? err.message : 'Unable to remove item');
    }
  }

  async function handleClear() {
    setError(null);
    setLoading(true);
    try {
      await clear();
    } catch (err: any) {
      console.error(err);
      setError(typeof err?.message === 'string' ? err.message : 'Unable to clear cart');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-12">
      <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Your ritual bag</p>
          <h1 className="font-heading text-3xl text-text">Shopping bag</h1>
        </div>
        <button
          onClick={handleClear}
          className="rounded-full border border-border/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading || items.length === 0}
        >
          Clear bag
        </button>
      </header>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-border/60 bg-white/70 p-10 text-center text-sm text-muted">
          Your bag is feeling light. Explore the <a className="text-accent underline" href="/shop">collection</a> to begin your ritual.
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-white/80 p-6 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex w-full items-center gap-4 sm:w-auto">
                <img
                  src={variantImageForSku(item.sku)}
                  alt={item.title}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
                <div>
                  <div className="font-semibold text-text">{item.title}</div>
                  {item.sku && <div className="text-xs uppercase tracking-wide text-muted">{item.sku}</div>}
                  <div className="text-sm text-muted">{formatCurrency(item.unitPriceCents)} each</div>
                </div>
              </div>
              <div className="flex w-full items-center justify-between gap-4 sm:w-auto">
                <label className="text-xs uppercase tracking-wide text-muted" htmlFor={`qty-${item.id}`}>
                  Qty
                </label>
                <input
                  id={`qty-${item.id}`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                  className="w-20 rounded-full border border-border/60 bg-white/80 px-3 py-2 text-sm text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-xs font-semibold uppercase tracking-wide text-accent transition hover:opacity-80"
                >
                  Remove
                </button>
              </div>
              <div className="min-w-[6rem] text-right font-semibold text-text">
                {formatCurrency(item.lineTotalCents)}
              </div>
            </div>
          ))}

          <div className="flex flex-col items-end gap-4 rounded-3xl border border-border/60 bg-white/80 p-6 shadow-sm backdrop-blur">
            <div className="text-sm text-muted">Subtotal</div>
            <div className="text-2xl font-heading text-text">{formatCurrency(subtotalCents)}</div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Processing…' : 'Proceed to checkout'}
              </button>
              <button
                onClick={refresh}
                className="rounded-full border border-border/70 px-6 py-3 text-sm font-semibold text-text transition hover:border-accent hover:text-accent"
              >
                Refresh totals
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}
    </main>
  );
}