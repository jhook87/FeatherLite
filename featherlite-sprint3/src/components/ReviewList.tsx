/**
 * ReviewList component renders a list of customer reviews for a product.
 * Accepts an array of review objects with name, rating and comment.
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
    <div className="space-y-4 mt-6">
      {reviews.map((r) => (
        <div key={r.id} className="border-b pb-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">{r.name ?? 'Anonymous'}</span>
            <span className="text-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < r.rating ? '★' : '☆'}</span>
              ))}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-700">{r.comment}</p>
          <p className="mt-1 text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}