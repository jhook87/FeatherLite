"use client";

import { useCallback, useEffect, useState } from 'react';
import SystemStatusBanner from './SystemStatusBanner';

type ModerationReview = {
  id: string;
  name?: string | null;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  product?: {
    name: string;
    slug: string;
  } | null;
};

async function fetchReviews(status: string) {
  const res = await fetch(`/api/reviews?status=${status}&include=product`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Unable to load reviews');
  }
  return (await res.json()) as ModerationReview[];
}

export default function AdminReviewDashboard() {
  const [pending, setPending] = useState<ModerationReview[]>([]);
  const [approved, setApproved] = useState<ModerationReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pendingReviews, approvedReviews] = await Promise.all([
        fetchReviews('pending'),
        fetchReviews('approved'),
      ]);
      setPending(pendingReviews);
      setApproved(approvedReviews);
    } catch (err: any) {
      setError(err.message || 'Unable to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function moderateReview(id: string, status: ModerationReview['status']) {
    setSuccessMessage('');
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to update review');
      }
      const updated = (await res.json()) as ModerationReview;
      setSuccessMessage(
        `${updated.name ?? 'Anonymous'} on ${updated.product?.name ?? 'Unknown product'} marked as ${status.toLowerCase()}.`
      );
      await load();
    } catch (err: any) {
      setError(err.message || 'Unable to update review');
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  return (
    <div className="space-y-8">
      <SystemStatusBanner />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl text-text">Review moderation</h1>
          <p className="text-sm text-muted">Approve new submissions to feature them on product detail pages.</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="self-start rounded-full border border-border/70 px-5 py-2 text-sm font-medium text-text transition hover:border-accent hover:text-accent"
        >
          Sign out
        </button>
      </div>

      {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {successMessage && (
        <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{successMessage}</p>
      )}

      <section className="rounded-[2rem] border border-border/60 bg-white/80 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl text-text">Pending reviews</h2>
          {!loading && <span className="text-sm text-muted">{pending.length} awaiting approval</span>}
        </div>
        {loading ? (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl bg-surface/60" />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-border/60 bg-highlight/60 px-4 py-3 text-sm text-text">
            No reviews need attention right now.
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            {pending.map((review) => (
              <li key={review.id} className="rounded-2xl border border-border/60 bg-white/90 p-4 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text">{review.name || 'Anonymous'}</p>
                    <p className="text-xs uppercase tracking-wide text-muted">
                      {review.product?.name ?? 'Unassigned'} • {new Date(review.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 text-sm text-accent">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span key={index}>{index < review.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{review.comment}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => moderateReview(review.id, 'APPROVED')}
                    className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:shadow-md"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => moderateReview(review.id, 'REJECTED')}
                    className="rounded-full border border-border/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text transition hover:border-accent hover:text-accent"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => moderateReview(review.id, 'PENDING')}
                    className="rounded-full border border-border/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted hover:border-border/80 hover:text-text"
                  >
                    Requeue
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[2rem] border border-border/60 bg-white/80 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl text-text">Approved reviews</h2>
          {!loading && <span className="text-sm text-muted">{approved.length} live</span>}
        </div>
        {approved.length === 0 ? (
          <p className="mt-6 text-sm text-muted">Approved reviews will appear here for easy auditing.</p>
        ) : (
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {approved.map((review) => (
              <li key={review.id} className="rounded-2xl border border-border/50 bg-white/90 p-4 text-sm text-muted">
                <p className="font-semibold text-text">{review.name || 'Anonymous'}</p>
                <p className="text-xs uppercase tracking-wide text-muted">
                  {review.product?.name ?? 'Unassigned'} • {new Date(review.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-2 leading-relaxed">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
