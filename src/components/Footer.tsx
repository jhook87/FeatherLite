/**
 * A simple footer displayed at the bottom of each page. Shows the
 * current year and the company name and address. Adjust the address
 * or add additional links such as privacy policy and terms of service
 * in future iterations.
 */
export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-600">
        <p>
          © {new Date().getFullYear()} FeatherLite Cosmetics • Winston-Salem, NC
        </p>
      </div>
    </footer>
  );
}