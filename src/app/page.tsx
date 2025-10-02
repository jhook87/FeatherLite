import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getDummyProducts, getDummyReviews } from '@/lib/dummyContent';

const heroStats = [
  { label: 'Feather-light finish', value: '24h' },
  { label: 'Botanical actives', value: '6' },
  { label: 'Vegan & cruelty free', value: '100%' },
];

const ritualSteps = [
  {
    title: 'Prep',
    detail: 'Awaken skin with a mist of mineral essence to boost slip and glow.',
  },
  {
    title: 'Perfect',
    detail: 'Sweep on Weightless Mineral Foundation in light, feathered strokes.',
  },
  {
    title: 'Polish',
    detail: 'Set with Silk Veil Powder and tap Luminous Blush onto cheekbones.',
  },
];

const ingredientHighlights = [
  {
    title: 'Rosehip oil',
    body: 'Replenishes the skin barrier with essential fatty acids for lasting comfort.',
  },
  {
    title: 'Rice powder',
    body: 'Naturally blurs texture with a breathable, feather-light touch.',
  },
  {
    title: 'Calendula extract',
    body: 'Calms and soothes even sensitive complexions with anti-inflammatory properties.',
  },
];

/**
 * Home page hero, ritual overview and featured products. Uses dummy content so the
 * UI feels finished before live Shopify data and imagery arrive.
 */
export default function Home() {
  const products = getDummyProducts();
  const featured = products.slice(0, 3);
  const testimonials = getDummyReviews('weightless-mineral-foundation').slice(0, 2);

  return (
    <main className="mx-auto max-w-6xl space-y-24 px-4 pb-24 pt-16">
      <section className="relative grid gap-10 overflow-hidden rounded-[3rem] border border-border/60 bg-white/80 p-10 shadow-xl backdrop-blur sm:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col justify-between gap-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-highlight/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-text">
              New Season • Mineral Ritual
            </span>
            <h1 className="font-heading text-4xl leading-tight text-text sm:text-5xl">
              Because your glow should feel like wearing nothing at all.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              FeatherLite formulas fuse mineral science with nourishing botanicals so every sweep feels weightless,
              luminous and kind to skin.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              >
                Shop the collection
              </Link>
              <Link
                href="/shop?season=Spring"
                className="inline-flex items-center gap-2 rounded-full border border-border/70 px-6 py-3 text-sm font-semibold text-text transition hover:border-accent hover:text-accent"
              >
                Explore seasonal edits
              </Link>
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border/60 bg-white/60 px-4 py-3 text-center shadow-sm">
                <dt className="text-xs uppercase tracking-wide text-muted">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-semibold text-text">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-4 rounded-[2.5rem] bg-gradient-to-br from-primary via-white to-accent/20" />
          <div className="relative rounded-[2.5rem] border border-border/70 bg-white/90 p-8 shadow-2xl">
            <div className="space-y-6 text-sm text-muted">
              <p className="text-base font-semibold text-text">“It feels like silk and photographs like a dream.”</p>
              {testimonials.map((review) => (
                <div key={review.id} className="rounded-2xl border border-border/40 bg-white/80 p-4">
                  <div className="text-xs uppercase tracking-wide text-muted">{review.name}</div>
                  <p className="mt-2 text-sm text-text">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <header className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Featherlight heroes</p>
            <h2 className="mt-2 font-heading text-3xl text-text">Cult favourites, now in bloom</h2>
          </div>
          <Link href="/shop" className="rounded-full border border-border/70 px-5 py-2 text-sm font-medium text-text transition hover:border-accent hover:text-accent">
            Shop all products
          </Link>
        </header>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section id="ritual" className="rounded-[3rem] border border-border/60 bg-white/80 p-10 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Our ritual</p>
            <h2 className="mt-2 font-heading text-3xl text-text">Three steps to a feather-light finish</h2>
          </div>
          <Link href="/product/weightless-mineral-foundation" className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md">
            Try the hero set
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {ritualSteps.map((step) => (
            <div key={step.title} className="rounded-2xl border border-border/60 bg-white/70 p-6 shadow-sm">
              <h3 className="font-heading text-xl text-text">{step.title}</h3>
              <p className="mt-3 text-sm text-muted">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="ingredients">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Ingredient alchemy</p>
            <h2 className="mt-2 font-heading text-3xl text-text">Mineral science meets plant soul</h2>
          </div>
          <span className="rounded-full bg-highlight/70 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-text">
            Dermatologist tested
          </span>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {ingredientHighlights.map((item) => (
            <div key={item.title} className="rounded-3xl border border-border/60 bg-white/70 p-6 shadow-sm backdrop-blur">
              <h3 className="font-heading text-xl text-text">{item.title}</h3>
              <p className="mt-3 text-sm text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="rounded-[3rem] border border-border/60 bg-gradient-to-r from-primary/80 via-white to-accent/10 p-10 shadow-xl">
          <div className="grid gap-8 sm:grid-cols-[1.1fr_1fr] sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Stay in the know</p>
              <h2 className="mt-2 font-heading text-3xl text-text">Workshops, shade launches and backstage tips.</h2>
              <p className="mt-4 text-sm text-muted">
                Join our beauty circle to be the first to experience limited drops, private classes and mineral skincare
                secrets.
              </p>
            </div>
            <form className="flex flex-col gap-4 sm:flex-row">
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-full border border-border/70 bg-white/80 px-5 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              <button
                type="submit"
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
              >
                Join now
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}