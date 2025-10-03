"use client";

import { FormEvent, useState } from 'react';

type ReviewFormProps = {
  productSlug: string;
};

export default function ReviewForm({ productSlug }: ReviewFormProps) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    setErrorMessage('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug: productSlug, name, rating, comment }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to submit review at this time.');
      }
      setStatus('success');
      setName('');
      setRating(5);
      setComment('');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Unable to submit review at this time.');
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-border/60 bg-white/70 p-6 shadow-sm">
      <h3 className="font-heading text-xl text-text">Leave a review</h3>
      <p className="mt-2 text-sm text-muted">
        Share how FeatherLite is working for your skin. Reviews are published once they pass our moderation check.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-text">
          <span className="text-xs uppercase tracking-wide text-muted">Name (optional)</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-full border border-border/60 bg-white/90 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            placeholder="Your name"
          />
        </label>
        <label className="block text-sm font-medium text-text">
          <span className="text-xs uppercase tracking-wide text-muted">Rating</span>
          <select
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
            className="mt-2 w-full rounded-full border border-border/60 bg-white/90 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} stars
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-text">
          <span className="text-xs uppercase tracking-wide text-muted">Review</span>
          <textarea
            required
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="mt-2 w-full rounded-3xl border border-border/60 bg-white/90 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            rows={4}
            placeholder="Tell us about the finish, wear and feel."
          />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'submitting' ? 'Sending…' : 'Submit review'}
          </button>
          {status === 'success' && (
            <p className="text-sm text-accent">Thank you! Your review is awaiting moderation.</p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
      </form>
    </section>
  );
}
