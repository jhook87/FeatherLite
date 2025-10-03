import { Dispatch, SetStateAction } from 'react';

/**
 * Filters component for the shop page. Wrapped inside a frosted glass panel with rounded
 * corners so it feels at home alongside the refreshed design. Uses controlled values
 * passed via props and notifies parent on change.
*/
export default function Filters({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  season,
  onSeasonChange,
  finish,
  onFinishChange,
  coverage,
  onCoverageChange,
  concern,
  onConcernChange,
  sort,
  onSortChange,
}: {
  query: string;
  onQueryChange: Dispatch<SetStateAction<string>>;
  category: string;
  onCategoryChange: Dispatch<SetStateAction<string>>;
  season: string;
  onSeasonChange: Dispatch<SetStateAction<string>>;
  finish: string;
  onFinishChange: Dispatch<SetStateAction<string>>;
  coverage: string;
  onCoverageChange: Dispatch<SetStateAction<string>>;
  concern: string;
  onConcernChange: Dispatch<SetStateAction<string>>;
  sort: string;
  onSortChange: Dispatch<SetStateAction<string>>;
}) {
  return (
    <section className="mb-8 rounded-3xl border border-border/60 bg-white/70 p-6 shadow-sm backdrop-blur" aria-label="Product filters">
      <form
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        role="search"
        aria-label="Search FeatherLite products"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="flex-1 text-sm font-medium text-text" htmlFor="filters-search">
          <span className="text-xs uppercase tracking-wide text-muted">Search</span>
          <input
            id="filters-search"
            type="search"
            placeholder="Search products"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="mt-2 w-full rounded-full border border-border/60 bg-white/80 px-4 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </label>
        <label className="text-sm font-medium text-text" htmlFor="filters-category">
          <span className="text-xs uppercase tracking-wide text-muted">Category</span>
          <select
            id="filters-category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="mt-2 w-full rounded-full border border-border/60 bg-white/80 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">All Categories</option>
            <option value="foundation">Foundation</option>
            <option value="blush">Blush</option>
            <option value="eyeshadow">Eyeshadow</option>
            <option value="set">Sets</option>
          </select>
        </label>
        <label className="text-sm font-medium text-text" htmlFor="filters-season">
          <span className="text-xs uppercase tracking-wide text-muted">Season</span>
          <select
            id="filters-season"
            value={season}
            onChange={(e) => onSeasonChange(e.target.value)}
            className="mt-2 w-full rounded-full border border-border/60 bg-white/80 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">All Seasons</option>
            <option value="Year-Round">Year-Round</option>
            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
          </select>
        </label>
      </form>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4" role="group" aria-label="Filter by formula attributes">
        <label className="text-sm font-medium text-text" htmlFor="filters-finish">
          <span className="text-xs uppercase tracking-wide text-muted">Finish</span>
          <select
            id="filters-finish"
            value={finish}
            onChange={(e) => onFinishChange(e.target.value)}
            className="mt-2 w-full rounded-full border border-border/60 bg-white/80 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">All finishes</option>
            <option value="matte">Matte</option>
            <option value="satin">Satin</option>
            <option value="luminous">Luminous</option>
            <option value="radiant">Radiant</option>
            <option value="velvet">Velvet</option>
          </select>
        </label>
        <label className="text-sm font-medium text-text" htmlFor="filters-coverage">
          <span className="text-xs uppercase tracking-wide text-muted">Coverage</span>
          <select
            id="filters-coverage"
            value={coverage}
            onChange={(e) => onCoverageChange(e.target.value)}
            className="mt-2 w-full rounded-full border border-border/60 bg-white/80 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">All coverage</option>
            <option value="sheer">Sheer</option>
            <option value="buildable">Buildable</option>
            <option value="medium">Medium</option>
            <option value="full">Full</option>
          </select>
        </label>
        <label className="text-sm font-medium text-text" htmlFor="filters-concern">
          <span className="text-xs uppercase tracking-wide text-muted">Skin concern</span>
          <select
            id="filters-concern"
            value={concern}
            onChange={(e) => onConcernChange(e.target.value)}
            className="mt-2 w-full rounded-full border border-border/60 bg-white/80 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">All concerns</option>
            <option value="sensitivity">Sensitivity</option>
            <option value="oil-control">Oil control</option>
            <option value="redness">Redness</option>
            <option value="shine">Shine</option>
            <option value="texture">Texture</option>
            <option value="dullness">Dullness</option>
            <option value="creasing">Creasing</option>
          </select>
        </label>
        <label className="text-sm font-medium text-text" htmlFor="filters-sort">
          <span className="text-xs uppercase tracking-wide text-muted">Sort by</span>
          <select
            id="filters-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="mt-2 w-full rounded-full border border-border/60 bg-white/80 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
            <option value="popularity">Most Loved</option>
          </select>
        </label>
      </div>
    </section>
  );
}

