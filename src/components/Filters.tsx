import { Dispatch, SetStateAction } from 'react';

/**
 * Filters component for the shop page. Provides a search input and
 * dropdown filters for category and season. Uses controlled values
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
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <input
        type="text"
        placeholder="Search products"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="flex-1 border rounded-md p-2"
      />
      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="border rounded-md p-2"
      >
        <option value="">All Categories</option>
        <option value="foundation">Foundation</option>
        <option value="blush">Blush</option>
        <option value="eyeshadow">Eyeshadow</option>
        <option value="set">Sets</option>
      </select>
      <select
        value={season}
        onChange={(e) => onSeasonChange(e.target.value)}
        className="border rounded-md p-2"
      >
        <option value="">All Seasons</option>
        <option value="Year-Round">Year-Round</option>
        <option value="Fall">Fall</option>
        <option value="Winter">Winter</option>
        <option value="Spring">Spring</option>
        <option value="Summer">Summer</option>
      </select>
    </div>
  );
}