import Link from 'next/link';

/**
 * Home page provides a simple introduction and directs visitors to the
 * shop. In future sprints this page could be replaced with a more
 * elaborate hero banner, mineral showcase and product carousel as
 * outlined in the design guidelines.
 */
export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="font-heading text-5xl tracking-tight">Because You’re Beautiful</h1>
      <p className="mt-4 text-lg text-gray-700">
        Clean, feather-light formulas crafted from six essential minerals.
      </p>
      <div className="mt-8">
        <Link
          href="/shop"
          className="inline-block rounded-full bg-foreground text-white px-6 py-3 hover:bg-accent transition"
        >
          Shop the Collection
        </Link>
      </div>
    </main>
  );
}