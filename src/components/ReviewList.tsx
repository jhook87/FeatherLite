/**
 * ReviewList component renders customer reviews in frosted cards. Accepts an array of
 * review objects with name, rating and comment, formatting dates and ratings with the
 * refreshed brand styling.
 */
export type Review = {
  id: string;
  name?: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-sm text-gray-500">No reviews yet.</p>;
  }
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {reviews.map((r) => (
        <div
          key={r.id}
          className="rounded-3xl border border-border/60 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-text">{r.name ?? 'Anonymous'}</span>
            <span className="text-xs uppercase tracking-wide text-muted">
              {new Date(r.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-sm text-accent">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>{i < r.rating ? '★' : '☆'}</span>
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{r.comment}</p>
        </div>
      ))}
    </div>
  );
}