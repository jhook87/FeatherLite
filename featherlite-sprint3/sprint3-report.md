# Sprint 3 Report — FeatherLite Cosmetics Storefront

## Overview

This sprint focused on elevating the FeatherLite storefront beyond its Sprint 2 baseline by adding a true **search and filter experience**, integrating **customer reviews** and **shade swatches**, and ensuring the checkout funnel remains Stripe‑ready.  We also extended the data model to support colour metadata for variants and persisted customer reviews.  These upgrades bring the site closer to a full‑featured e‑commerce experience while respecting the existing brand palette and typography【246546759107285†L23-L45】【246546759107285†L64-L71】 and the original wireframe guidance for search and product pages【153001263389822†L0-L23】【143960882804577†L7-L61】.

## Achievements

### Data model & seeding

- **Prisma schema updates**: added an optional `hex` field to the `Variant` model to store shade colours and introduced a new `Review` model for customer feedback.  The `Product` model now has a `reviews` relation.
- **Seed script**: wrote `prisma/seed.ts` to populate a “Year‑Round” collection, a sample foundation product with three shades (each with a hex value), and several example reviews.  This scaffolds the new features and demonstrates how real product data can be seeded.

### Components & UI

- **Filters component**: added a reusable `Filters` component allowing customers to search products by name and filter by category or season.  Integrated this into the shop page so results update reactively as users type or select filters.
- **Shade swatches**: created `ShadeSwatches.tsx` to render small coloured dots corresponding to the `hex` values on variants.  Swatches appear on product cards and the product detail page, giving a more tactile sense of shade range.
- **Product cards**: built `ProductCard.tsx` to show product name, kind, price and up to eight shade dots.  Cards link to the corresponding product detail page.
- **Cart state management**: implemented `CartProvider.tsx` using React context so cart contents persist across pages.  Added a simple badge to the nav showing the total quantity in the cart.
- **Product detail enhancements**: rewrote `src/app/product/[slug]/page.tsx` to fetch product data and reviews, display swatches, support variant selection, and embed a customer review list (`ReviewList.tsx`).  Added “Add to cart” and “Buy now” buttons; the latter triggers a Stripe checkout session.
- **Cart page**: created `src/app/cart/page.tsx`, summarising items in the cart and allowing checkout or clearing the cart.  It uses the same Stripe endpoint as the product page for consistency.
- **Navigation & layout**: added a minimalist `Navbar` with links to the home page, shop and cart (showing quantity), and a `Footer` with company information.  Wrapped the site in a `RootLayout` that sets the global font family and applies the Tailwind colour palette【246546759107285†L23-L45】.
- **Home page placeholder**: added a basic home page that features a hero message and call‑to‑action.  This can later be replaced with a more sophisticated hero and storytelling elements.

### API endpoints

- Implemented API routes under `/api/products` for listing products and fetching individual product details; each includes variants and collection metadata.
- Created `/api/reviews` to fetch reviews for a product by slug.
- Added `/api/checkout` to create a Stripe Checkout session from cart items and `/api/stripe/webhook` to persist completed orders in the database.  These endpoints mirror the Stripe setup delivered in Sprint 2.
- Added `/api/stripe/webhook` with body‑parser disabled to verify signatures and store orders upon completion.

### Miscellaneous

- Added a `tsconfig.json`, `next-env.d.ts`, `postcss.config.js` and `next.config.js` so that the project builds correctly with TypeScript and Tailwind.
- Added a `globals.css` file to apply the brand colours as the default background and text colours and to set global font families.

## Remaining Work / Recommendations

- **Real product data**: import the full catalogue from the provided Excel file into Prisma using the new hex field and review model.  This will populate the shop with the real shades, product names and pricing.
- **User‑generated reviews**: add a POST handler in `/api/reviews` and a form on the product page to allow customers to submit their own reviews.
- **Images**: replace placeholder squares with actual product photography and lifestyle shots, either by uploading them to `public/images` or linking to a CDN.  The design guidelines encourage natural imagery to convey “natural radiance”【153001263389822†L0-L23】.
- **Advanced filters & sorting**: support sorting by price or popularity and filtering by attributes like finish or coverage.  If product metadata includes these attributes they can be exposed via the Filters component.
- **Accessibility & SEO**: ensure all images include alt text, add semantic HTML tags where appropriate, and expand meta tags for social sharing.

## Conclusion

Sprint 3 delivers the foundation for a searchable, filterable shopping experience with rich product detail pages and customer reviews.  Together with the Stripe‑ready checkout funnel from Sprint 2, these changes put the FeatherLite storefront on solid footing for a public launch.  Subsequent sprints should focus on bringing in real data, user‑generated content, and further polishing the visual experience.