// Shop page with search and filter capabilities for Sprint 3
'use client';

import { useEffect, useMemo, useState } from 'react';
import Filters from '@/components/Filters';
import ProductCard from '@/components/ProductCard';
import { getDummyProducts } from '@/lib/dummyContent';
import { getProductMeta, ProductAttributes } from '@/data/productMeta';
import ComparisonDrawer from '@/components/ComparisonDrawer';

interface Product {
  id: string;
  slug: string;
  name: string;
  kind: string;
  variants: { priceCents: number; name: string; sku: string; hex?: string }[];
  collection?: { season?: string };
  highlights?: string[];
  averageRating?: number | null;
  reviewCount?: number;
  attributes?: ProductAttributes;
  popularityScore?: number;
}

export default function ShopPage() {
  const fallbackProducts = useMemo(() => getDummyProducts() as Product[], []);
  const fallbackEnriched = useMemo(() => {
    return fallbackProducts.map((product) => {
      const attributes = getProductMeta(product.slug);
      return {
        ...product,
        attributes,
        popularityScore: attributes?.popularityScore ?? 0,
      } as Product;
    });
  }, [fallbackProducts]);
  const [products, setProducts] = useState<Product[]>(fallbackEnriched);
  const [filtered, setFiltered] = useState<Product[]>(fallbackEnriched);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [season, setSeason] = useState('');
  const [finish, setFinish] = useState('');
  const [coverage, setCoverage] = useState('');
  const [concern, setConcern] = useState('');
  const [sort, setSort] = useState('featured');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareMessage, setCompareMessage] = useState<string | null>(null);

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
        const enriched = data.map((product) => {
          const attributes = getProductMeta(product.slug);
          return {
            ...product,
            attributes,
            popularityScore: attributes?.popularityScore ?? 0,
          };
        });
        setProducts(enriched);
        setFiltered(enriched);
      } catch (err: any) {
        console.warn('Using fallback products for shop grid', err);
        setProducts(fallbackEnriched);
        setFiltered(fallbackEnriched);
        setError('Showing our studio collection while we connect to Shopify.');
      } finally {
        setLoading(false);
      }
    })();
  }, [fallbackEnriched, fallbackProducts]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedWishlist = window.localStorage.getItem('featherlite:wishlist');
    const storedCompare = window.localStorage.getItem('featherlite:compare');
    if (storedWishlist) {
      try {
        setWishlist(JSON.parse(storedWishlist));
      } catch (error) {
        console.error('Unable to parse wishlist from storage', error);
      }
    }
    if (storedCompare) {
      try {
        setCompareList(JSON.parse(storedCompare));
      } catch (error) {
        console.error('Unable to parse compare list from storage', error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('featherlite:wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('featherlite:compare', JSON.stringify(compareList));
  }, [compareList]);

  useEffect(() => {
    if (compareList.length < 2) {
      setCompareOpen(false);
    }
  }, [compareList]);

  const enrichedProducts = useMemo(() => {
    return products.map((product) => {
      const attributes = product.attributes ?? getProductMeta(product.slug);
      return {
        ...product,
        attributes,
        popularityScore: attributes?.popularityScore ?? product.popularityScore ?? 0,
      };
    });
  }, [products]);

  // Filter when query/category/season changes or products change
  useEffect(() => {
    let list = [...enrichedProducts];
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
    if (finish) {
      list = list.filter((p) => p.attributes?.finish === finish);
    }
    if (coverage) {
      list = list.filter((p) => p.attributes?.coverage === coverage);
    }
    if (concern) {
      list = list.filter((p) => p.attributes?.concerns?.includes(concern));
    }

    const getPrice = (product: Product) => product.variants?.[0]?.priceCents ?? 0;
    list.sort((a, b) => {
      if (sort === 'price-asc') {
        return getPrice(a) - getPrice(b);
      }
      if (sort === 'price-desc') {
        return getPrice(b) - getPrice(a);
      }
      if (sort === 'rating') {
        const aRating = a.averageRating ?? 0;
        const bRating = b.averageRating ?? 0;
        return bRating - aRating;
      }
      if (sort === 'popularity') {
        const aScore = (a.popularityScore ?? 0) + (a.reviewCount ?? 0) * 2;
        const bScore = (b.popularityScore ?? 0) + (b.reviewCount ?? 0) * 2;
        return bScore - aScore;
      }
      return 0;
    });

    setFiltered(list);
  }, [query, category, season, finish, coverage, concern, sort, enrichedProducts]);

  function toggleWishlist(slug: string) {
    setWishlist((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]
    );
  }

  function toggleCompare(slug: string) {
    setCompareMessage(null);
    setCompareList((current) => {
      if (current.includes(slug)) {
        return current.filter((item) => item !== slug);
      }
      if (current.length >= 3) {
        setCompareMessage('Select up to three products to compare side-by-side.');
        return current;
      }
      const updated = [...current, slug];
      if (updated.length >= 2) {
        setCompareOpen(true);
      }
      return updated;
    });
  }

  const wishlistProducts = filtered.filter((product) => wishlist.includes(product.slug));
  const comparisonProducts = enrichedProducts.filter((product) => compareList.includes(product.slug));

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
        finish={finish}
        onFinishChange={setFinish}
        coverage={coverage}
        onCoverageChange={setCoverage}
        concern={concern}
        onConcernChange={setConcern}
        sort={sort}
        onSortChange={setSort}
      />

      {error && <p className="rounded-2xl border border-border/60 bg-highlight/60 px-4 py-3 text-sm text-text">{error}</p>}
      {compareMessage && (
        <p className="rounded-2xl border border-border/60 bg-white/80 px-4 py-3 text-sm text-accent">{compareMessage}</p>
      )}

      {wishlistProducts.length > 0 && (
        <section className="rounded-3xl border border-border/60 bg-white/70 p-6 shadow-sm">
          <header className="flex items-center justify-between">
            <h2 className="font-heading text-xl text-text">Your wishlist</h2>
            <span className="text-xs uppercase tracking-wide text-muted">{wishlistProducts.length} saved</span>
          </header>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {wishlistProducts.slice(0, 2).map((product) => (
              <article key={product.id} className="rounded-2xl border border-border/50 bg-white/90 p-4 text-sm text-muted">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text">{product.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.slug)}
                    className="text-xs uppercase tracking-wide text-accent"
                  >
                    Remove
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {product.attributes?.finish ?? 'feather-light'} finish • {product.attributes?.coverage ?? 'buildable'} coverage
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

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
              <ProductCard
                key={p.id}
                product={p}
                onToggleWishlist={toggleWishlist}
                onToggleCompare={toggleCompare}
                wishlistActive={wishlist.includes(p.slug)}
                compareActive={compareList.includes(p.slug)}
              />
            ))}
          </div>
        </>
      )}

      <ComparisonDrawer
        open={compareOpen && comparisonProducts.length >= 2}
        onClose={() => setCompareOpen(false)}
        products={comparisonProducts}
        onRemove={toggleCompare}
        onClear={() => setCompareList([])}
      />
    </main>
  );
}