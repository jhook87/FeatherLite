// Shop page with search and filter capabilities for Sprint 3
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  return (
    <Suspense fallback={<ShopPageFallback />}> 
      <ShopPageContent />
    </Suspense>
  );
}

function ShopPageFallback() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16" aria-busy="true" aria-live="polite">
      <div className="space-y-6">
        <div className="h-12 w-2/3 animate-pulse rounded-full bg-primary/40" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-3xl bg-primary/30" />
          ))}
        </div>
      </div>
    </main>
  );
}

function ShopPageContent() {
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
  const fallbackMap = useMemo(() => {
    return fallbackEnriched.reduce<Record<string, Product>>((acc, product) => {
      acc[product.slug] = product;
      return acc;
    }, {});
  }, [fallbackEnriched]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const resultsHeadingRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>(fallbackEnriched);
  const [catalog, setCatalog] = useState<Record<string, Product>>(fallbackMap);
  const [totalAvailable, setTotalAvailable] = useState(fallbackEnriched.length);
  const [query, setQuery] = useState(() => searchParams.get('query') ?? '');
  const [category, setCategory] = useState(() => searchParams.get('category')?.toLowerCase() ?? '');
  const [season, setSeason] = useState(() => searchParams.get('season') ?? '');
  const [finish, setFinish] = useState(() => searchParams.get('finish')?.toLowerCase() ?? '');
  const [coverage, setCoverage] = useState(() => searchParams.get('coverage')?.toLowerCase() ?? '');
  const [concern, setConcern] = useState(() => searchParams.get('concern')?.toLowerCase() ?? '');
  const [sort, setSort] = useState(() => searchParams.get('sort')?.toLowerCase() ?? 'featured');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareMessage, setCompareMessage] = useState<string | null>(null);

  // Keep URL in sync with the chosen filters for sharing and SEO.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (category) params.set('category', category);
    if (season) params.set('season', season);
    if (finish) params.set('finish', finish);
    if (coverage) params.set('coverage', coverage);
    if (concern) params.set('concern', concern);
    if (sort && sort !== 'featured') params.set('sort', sort);
    const search = params.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  }, [query, category, season, finish, coverage, concern, sort, router, pathname]);

  // Fetch products on mount
  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      if (category) params.set('category', category);
      if (season) params.set('season', season);
      if (finish) params.set('finish', finish);
      if (coverage) params.set('coverage', coverage);
      if (concern) params.set('concern', concern);
      if (sort && sort !== 'featured') params.set('sort', sort);

      try {
        const res = await fetch(`/api/products${params.size ? `?${params.toString()}` : ''}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error('Unable to load products at this time.');
        }
        const data = (await res.json()) as { items: Product[]; total: number };
        const enriched = data.items.map((product) => {
          const attributes = product.attributes ?? getProductMeta(product.slug);
          return {
            ...product,
            attributes,
            popularityScore: attributes?.popularityScore ?? product.popularityScore ?? 0,
          } as Product;
        });
        setProducts(enriched);
        setTotalAvailable(data.total ?? enriched.length);
        setCatalog((prev) => {
          const next = { ...prev };
          enriched.forEach((product) => {
            next[product.slug] = product;
          });
          return next;
        });
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return;
        }
        console.warn('Using fallback products for shop grid', err);
        setProducts(fallbackEnriched);
        setTotalAvailable(fallbackEnriched.length);
        setCatalog(fallbackMap);
        setError('Showing our studio collection while we connect to Shopify.');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [query, category, season, finish, coverage, concern, sort, fallbackEnriched, fallbackMap]);

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

  useEffect(() => {
    if (!loading && resultsHeadingRef.current) {
      resultsHeadingRef.current.focus();
    }
  }, [loading, products]);

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

  const wishlistProducts = wishlist
    .map((slug) => catalog[slug])
    .filter((product): product is Product => Boolean(product));
  const comparisonProducts = compareList
    .map((slug) => catalog[slug])
    .filter((product): product is Product => Boolean(product));

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 pb-16 pt-12" id="main-content" tabIndex={-1}>
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

      {error && (
        <p className="rounded-2xl border border-border/60 bg-highlight/60 px-4 py-3 text-sm text-text" role="alert">
          {error}
        </p>
      )}
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
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3" aria-live="polite">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-3xl border border-border/60 bg-white/60"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-border/60 bg-white/70 p-10 text-center text-sm text-muted" role="status">
          No products match those filters yet. Try clearing a filter or explore our seasonal edits.
        </div>
      ) : (
        <>
          <div
            className="flex flex-col gap-2 text-xs uppercase tracking-wide text-muted sm:flex-row sm:items-center sm:justify-between"
            ref={resultsHeadingRef}
            tabIndex={-1}
            aria-live="polite"
          >
            <span>
              {products.length} styles &middot; {totalAvailable} available
            </span>
            {query && <span>Searching for “{query}”</span>}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {products.map((p) => (
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