/**
 * A simple footer displayed at the bottom of each page. Shows the
 * current year and the company name and address. Adjust the address
 * or add additional links such as privacy policy and terms of service
 * in future iterations.
 */
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border/60 bg-surface/80 backdrop-blur">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <h2 className="font-heading text-lg text-text">FeatherLite</h2>
          <p className="text-sm text-muted">
            Clean, feather-light formulas crafted from six mineral essentials. Beauty that lets
            your skin breathe.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-text">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><a href="/shop" className="transition hover:text-accent">Shop All</a></li>
            <li><a href="/shop?season=Spring" className="transition hover:text-accent">Seasonal Edits</a></li>
            <li><a href="/#ritual" className="transition hover:text-accent">Ritual Guide</a></li>
            <li><a href="/about" className="transition hover:text-accent">About FeatherLite</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-text">Customer Care</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><a href="#" className="transition hover:text-accent">Shipping &amp; Returns</a></li>
            <li><a href="#" className="transition hover:text-accent">Shade Finder</a></li>
            <li><a href="#" className="transition hover:text-accent">Contact Concierge</a></li>
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-text">Join the glow list</h3>
          <p className="text-sm text-muted">
            Receive product drops, application tips and exclusive invites straight to your inbox.
          </p>
          <form className="flex gap-2">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-full border border-border/70 bg-white/80 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <button
              type="submit"
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              Sign up
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-border/60 bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-4 text-xs text-muted sm:flex-row">
          <p>© {year} FeatherLite Cosmetics • Crafted in Winston-Salem, NC</p>
          <div className="flex gap-4">
            <a href="#" className="transition hover:text-accent">Privacy</a>
            <a href="#" className="transition hover:text-accent">Terms</a>
            <a href="#" className="transition hover:text-accent">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}