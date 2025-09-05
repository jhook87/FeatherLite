"use client";

import { useEffect, useState } from 'react';
import { useCart } from '@/components/CartProvider';
import { variantImageForSku } from '@/lib/paths';

/**
 * Cart page displays the contents of the user's shopping cart. It
 * summarises each item with its SKU, name and quantity. Users can
 * proceed directly to checkout or clear the cart. To keep this
 * component simple no pricing information is displayed. For pricing
 * details the checkout session will compute the total server-side.
 */
export default function CartPage() {
  const { items, clear, updateQty, remove } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (res.ok && data?.url) {
        window.location.href = data.url;
        return;
      }
      setError(data?.error || 'Something went wrong');
    } catch (err) {
      console.error(err);
      setError('Failed to initiate checkout');
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
              key={item.sku}
              className="border p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Display the product or variant image */}
                <img
                  src={variantImageForSku(item.sku)}
                  alt={item.name ?? item.sku}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div>
                  <div className="font-medium">{item.name ?? item.sku}</div>
                  <div className="text-sm text-gray-600">SKU: {item.sku}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-between w-full sm:w-auto">
                <label className="text-sm text-gray-600" htmlFor={`qty-${item.sku}`}>
                  Qty:
                </label>
                <input
                  id={`qty-${item.sku}`}
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) => updateQty(item.sku, Number(e.target.value))}
                  className="w-16 border rounded px-2 py-1"
                />
                <button
                  onClick={() => remove(item.sku)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove
                </button>
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
              onClick={clear}
              className="rounded-full border px-6 py-3 hover:bg-primary/30 transition"
            >
              Clear Cart
            </button>
          </div>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </main>
  );
}