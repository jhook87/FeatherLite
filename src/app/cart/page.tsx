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
  const { items, clear, updateQty, remove, checkoutUrl, currencyCode, subtotalCents } = useCart();
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
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-heading text-3xl mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Display the product or variant image */}
                <img
                  src={variantImageForSku(item.sku)}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div>
                  <div className="font-medium">{item.title}</div>
                  {item.sku && (
                    <div className="text-sm text-gray-600">SKU: {item.sku}</div>
                  )}
                  <div className="text-sm text-gray-600">
                    {formatCurrency(item.unitPriceCents)} each
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-between w-full sm:w-auto">
                <label className="text-sm text-gray-600" htmlFor={`qty-${item.id}`}>
                  Qty:
                </label>
                <input
                  id={`qty-${item.id}`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                  className="w-16 border rounded px-2 py-1"
                />
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove
                </button>
              </div>
              <div className="text-right font-medium min-w-[6rem]">
                {formatCurrency(item.lineTotalCents)}
              </div>
            </div>
          ))}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="rounded-full bg-foreground text-white px-6 py-3 hover:bg-accent transition disabled:opacity-50"
            >
              {loading ? 'Processing…' : 'Checkout'}
            </button>
            <button
              onClick={handleClear}
              className="rounded-full border px-6 py-3 hover:bg-primary/30 transition disabled:opacity-50"
              disabled={loading}
            >
              Clear Cart
            </button>
          </div>
          <div className="text-right text-lg font-semibold">
            Subtotal: {formatCurrency(subtotalCents)}
          </div>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </main>
  );
}