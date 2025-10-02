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
}: {
  query: string;
  onQueryChange: Dispatch<SetStateAction<string>>;
  category: string;
  onCategoryChange: Dispatch<SetStateAction<string>>;
  season: string;
  onSeasonChange: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="mb-8 rounded-3xl border border-border/60 bg-white/70 p-6 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <label className="flex-1 text-sm font-medium text-text">
          <span className="text-xs uppercase tracking-wide text-muted">Search</span>
          <input
            type="text"
            placeholder="Search products"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="mt-2 w-full rounded-full border border-border/60 bg-white/80 px-4 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </label>
        <label className="md:w-48 text-sm font-medium text-text">
          <span className="text-xs uppercase tracking-wide text-muted">Category</span>
          <select
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
        <label className="md:w-48 text-sm font-medium text-text">
          <span className="text-xs uppercase tracking-wide text-muted">Season</span>
          <select
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
      </div>
    </div>
  );
}