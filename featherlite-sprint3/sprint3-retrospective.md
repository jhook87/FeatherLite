# Sprint 3 Retrospective

## What went well

- **Feature delivery**: We succeeded in adding meaningful functionality to the storefront within one sprint.  Search and filter controls, shade swatches, customer reviews and cart management all integrate smoothly and enhance the user experience.
- **Data model evolution**: The decision to extend the `Variant` model with a `hex` field and to introduce a `Review` model proved straightforward with Prisma.  The added seed script demonstrates how to populate these new entities.
- **Reusable components**: Components like `Filters`, `ShadeSwatches`, `ReviewList` and `CartProvider` are generic and easy to reuse or extend in future sprints.  This modularity should accelerate feature development.
- **Stripe integration**: Re‑using the checkout and webhook logic from Sprint 2 meant we could focus on UX improvements without reworking the payment stack.  The cart and product pages call the same API route, simplifying the codebase.

## What could be improved

- **Real content and imagery**: Because access to product photographs and lifestyle imagery is still limited, placeholders remain in place on the shop and product pages.  Obtaining final assets from the design team will greatly improve the aesthetic.
- **Data import**: The Excel file of products exists, but there is no automatic importer.  Writing a script to convert that file into Prisma seed data (including hex values and variant SKUs) will eliminate manual entry.
- **End‑to‑end testing**: Without running a full `next build` in this environment we could not verify the build pipeline.  We rely on the user to run the project locally and report any runtime issues.
- **Performance**: Rendering large lists of products client‑side may be inefficient.  In future, server‑side filtering in the API could replace some of the client logic.  Also, client‑side state like the cart could be persisted via `localStorage`.

## Lessons learnt

- **APIs via connectors**: Accessing the GitHub repository contents through the provided connector required careful use of the `search_available_apis` and `call_api` endpoints.  These connectors are read‑only, so modifications must be performed locally before being pushed manually.
- **Importance of design specifications**: Having the colour palette and typography defined early on made implementing the Tailwind theme straightforward【246546759107285†L23-L45】【246546759107285†L64-L71】.  Similarly, referring back to the original wireframes ensured the filter bar and product cards aligned with stakeholder expectations【153001263389822†L0-L23】【143960882804577†L7-L61】.
- **Iterative growth**: Each sprint builds on the previous one, and keeping components loosely coupled makes future enhancements (like user reviews and dynamic imagery) simpler to integrate.

## Future considerations

- **User input**: Enable customers to submit and edit their reviews.  This will require authentication and moderation workflows.
- **Swatch accuracy**: Tie the `hex` field to real colour values from the product manufacturer.  Consider adding an `imageUrl` per variant for more complex shades.
- **Automated deployment**: The project could benefit from a CI pipeline that runs Prisma migrations, seeds the database, builds the Next.js app and deploys to a platform like Vercel.