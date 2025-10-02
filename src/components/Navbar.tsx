"use client";

import Link from 'next/link';
import { useCart } from './CartProvider';

/**
 * Simple navigation bar displayed at the top of each page. Shows the
 * site logo, a link to the shop and a link to the cart with the
 * quantity of items currently in the cart. The quantity is derived
 * from the cart context.
 */
export default function Navbar() {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-heading text-xl tracking-wide">
          FeatherLite
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/shop" className="hover:underline">
            Shop
          </Link>
          <Link href="/cart" className="relative flex items-center gap-1">
            <span className="rounded-full border px-3 py-1 hover:bg-primary/20">
              Cart
            </span>
            {count > 0 && (
              <span className="absolute -top-1 -right-2 bg-accent text-white text-xs rounded-full px-1">
                {count}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}