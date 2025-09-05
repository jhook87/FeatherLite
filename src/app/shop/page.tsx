// Shop page with search and filter capabilities for Sprint 3
'use client';

import { useEffect, useState } from 'react';
import Filters from '@/components/Filters';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  slug: string;
  name: string;
  kind: string;
  variants: { priceCents: number; name: string; sku: string; hex?: string }[];
  collection?: { season?: string };
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [season, setSeason] = useState('');

  // Fetch products on mount
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/products', { cache: 'no-store' });
      const data = await res.json();
      setProducts(data);
      setFiltered(data);
    })();
  }, []);

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
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-heading text-3xl mb-4">Shop</h1>
      <Filters
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        season={season}
        onSeasonChange={setSeason}
      />
      {filtered.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}