"use client";

import { useEffect, useState } from 'react';

type Status = {
  id: string;
  label: string;
  category: 'platform' | 'shopify';
  configured: boolean;
  help: string;
};

type StatusSummary = {
  ready: boolean;
  pending: string[];
  shopifyReady: boolean;
};

type StatusResponse = {
  statuses: Status[];
  summary: StatusSummary;
};

export default function SystemStatusBanner() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/status', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Unable to verify configuration.');
        }
        const json = (await res.json()) as StatusResponse;
        if (!cancelled) {
          setData(json);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Unable to verify configuration.');
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-3xl border border-border/50 bg-white/70 px-5 py-4 text-sm text-muted shadow-sm" role="status">
        Checking Shopify and database configuration…
      </div>
    );
  }

  const { summary, statuses } = data;
  const readyLabel = summary.ready
    ? 'All systems are configured. FeatherLite is ready for launch.'
    : summary.shopifyReady
      ? 'Shopify is ready. Complete the remaining platform tasks before launch.'
      : 'Connect Shopify and finish the outstanding tasks to go live.';

  return (
    <section className="space-y-4 rounded-3xl border border-border/60 bg-white/80 p-6 shadow-sm">
      <div>
        <h2 className="font-heading text-2xl text-text">Launch readiness</h2>
        <p className="mt-1 text-sm text-muted">{readyLabel}</p>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {statuses.map((status) => (
          <li
            key={status.id}
            className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-white/70 p-4 text-sm text-muted shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-text">{status.label}</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  status.configured
                    ? 'bg-emerald-100 text-emerald-700'
                    : status.category === 'shopify'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                }`}
              >
                {status.configured ? 'Ready' : 'Action needed'}
              </span>
            </div>
            {!status.configured && <p>{status.help}</p>}
            {status.configured && status.category === 'shopify' && (
              <p className="text-xs text-muted">Live Shopify data will appear in the storefront.</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
