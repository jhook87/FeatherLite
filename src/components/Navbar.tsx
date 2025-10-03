"use client";

import Link from 'next/link';
import { useCart } from './CartProvider';

/**
 * Polished top navigation with brand mark, quick links and a glowing cart pill.
 * Cart quantity is sourced from the shared cart context so the badge updates in
 * real time as visitors add products while browsing.
 */
export default function Navbar() {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/shop?season=Year-Round', label: 'Collections' },
    { href: '/#ritual', label: 'Our Ritual' },
    { href: '/#ingredients', label: 'Ingredients' },
    { href: '/about', label: 'About' },
  ];
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-border/60">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <div className="flex items-center gap-10">
          <Link href="/" className="font-heading text-xl tracking-tight text-text">
            FeatherLite
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted transition hover:text-text"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            className="hidden rounded-full border border-border/70 px-4 py-2 text-sm font-medium text-text transition hover:border-accent hover:text-accent md:inline-flex"
          >
            Browse
          </Link>
          <Link href="/cart" className="relative inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md">
            Cart
            {count > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-semibold text-accent">
                {count}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
}