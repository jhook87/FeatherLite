import './globals.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Josefin_Sans, Crimson_Pro } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/components/CartProvider';

// Preload the fonts used for body and headings. These fonts are specified
// in the brand guidelines and imported from Google Fonts via the next/font
// API. Adjust weights as necessary to match your design.
const bodyFont = Josefin_Sans({ subsets: ['latin'], weight: ['400'] });
const headingFont = Crimson_Pro({ subsets: ['latin'], weight: ['400'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.featherlitecosmetics.com'),
  title: {
    default: 'FeatherLite Cosmetics',
    template: '%s · FeatherLite Cosmetics',
  },
  description: 'Clean, feather-light formulas crafted from six essential minerals.',
  openGraph: {
    title: 'FeatherLite Cosmetics',
    description: 'Feather-light mineral beauty rituals for a radiant, breathable glow.',
    type: 'website',
    url: 'https://www.featherlitecosmetics.com',
    siteName: 'FeatherLite Cosmetics',
    images: [
      {
        url: 'https://www.featherlitecosmetics.com/images/placeholders/product-placeholder.svg',
        width: 1200,
        height: 630,
        alt: 'FeatherLite Cosmetics mineral wardrobe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FeatherLite Cosmetics',
    description: 'Feather-light mineral beauty rituals for a radiant, breathable glow.',
    images: ['https://www.featherlitecosmetics.com/images/placeholders/product-placeholder.svg'],
  },
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
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
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