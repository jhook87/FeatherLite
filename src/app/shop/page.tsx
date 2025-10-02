// Shop page with search and filter capabilities for Sprint 3
'use client';

import { useEffect, useMemo, useState } from 'react';
import Filters from '@/components/Filters';
import ProductCard from '@/components/ProductCard';
import { getDummyProducts } from '@/lib/dummyContent';

interface Product {
  id: string;
  slug: string;
  name: string;
  kind: string;
  variants: { priceCents: number; name: string; sku: string; hex?: string }[];
  collection?: { season?: string };
  highlights?: string[];
}

export default function ShopPage() {
  const fallbackProducts = useMemo(() => getDummyProducts() as Product[], []);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [filtered, setFiltered] = useState<Product[]>(fallbackProducts);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [season, setSeason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Unable to load products at this time.');
        }
        const data = (await res.json()) as Product[];
        setProducts(data);
        setFiltered(data);
      } catch (err: any) {
        console.warn('Using fallback products for shop grid', err);
        setProducts(fallbackProducts);
        setFiltered(fallbackProducts);
        setError('Showing our studio collection while we connect to Shopify.');
      } finally {
        setLoading(false);
      }
    })();
  }, [fallbackProducts]);

  // Filter when query/category/season changes or products change
  useEffect(() => {
    let list = [...products];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (category) {
      list = list.filter((p) => p.kind.toLowerCase() === category);
    }
    if (season) {
      list = list.filter((p) => p.collection?.season === season);
    }
    setFiltered(list);
  }, [query, category, season, products]);

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 pb-16 pt-12">
      <section className="rounded-[3rem] border border-border/60 bg-white/80 p-10 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-wide text-muted">The mineral wardrobe</p>
          <h1 className="font-heading text-4xl text-text">Shop the FeatherLite ritual</h1>
          <p className="max-w-2xl text-sm text-muted">
            Explore our edit of feather-light essentials. Every formula is infused with mineral pigments and botanicals to
            deliver a fresh, luminous finish that feels like second skin.
          </p>
        </div>
      </section>

      <Filters
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        season={season}
        onSeasonChange={setSeason}
      />

      {error && <p className="rounded-2xl border border-border/60 bg-highlight/60 px-4 py-3 text-sm text-text">{error}</p>}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-3xl border border-border/60 bg-white/60"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-border/60 bg-white/70 p-10 text-center text-sm text-muted">
          No products match those filters yet. Try clearing a filter or explore our seasonal edits.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted">
            <span>{filtered.length} styles</span>
            {query && <span>Searching for “{query}”</span>}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}