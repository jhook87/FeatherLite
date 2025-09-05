import './globals.css';
import { ReactNode } from 'react';
import { Josefin_Sans, Crimson_Pro } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/components/CartProvider';

// Preload the fonts used for body and headings. These fonts are specified
// in the brand guidelines and imported from Google Fonts via the next/font
// API. Adjust weights as necessary to match your design.
const bodyFont = Josefin_Sans({ subsets: ['latin'], weight: ['400'] });
const headingFont = Crimson_Pro({ subsets: ['latin'], weight: ['400'] });

export const metadata = {
  title: 'FeatherLite Cosmetics',
  description: 'Clean, feather-light formulas crafted from six essential minerals.',
};

/**
 * Root layout wraps every page in the application. It applies global
 * typography, provides the cart context and renders a persistent
 * navigation bar and footer. The CartProvider ensures that cart state
 * is available across all pages on the client.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.className} bg-background text-text`}>
        {/* Inject heading font into global styles. */}
        <style>{`
          h1,h2,h3,h4,.font-heading { font-family: ${headingFont.style.fontFamily}, serif; }
        `}</style>
        <CartProvider>
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}