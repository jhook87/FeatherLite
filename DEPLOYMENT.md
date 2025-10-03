# FeatherLite Deployment Guide

This project is configured for deployment on [Vercel](https://vercel.com/). The configuration ensures that Prisma migrations are applied automatically during the build step and that all required environment variables are validated at runtime.

## 1. Prerequisites

1. **Database** – Create a PostgreSQL database (Neon, Supabase, Railway, RDS, etc.) and note the full connection string including the `?schema=` query parameter expected by Prisma.
2. **Shopify store** – Ensure you have a Shopify store with the following prepared:
   - A custom app with the **Storefront API** enabled and a Storefront access token.
   - The same app (or a second custom app) with the **Admin API** enabled and an Admin access token with read/write access to Products, Inventory, Orders, and Webhooks.
   - A webhook signing secret from the Admin app. You will point Shopify webhooks to Vercel after the first deployment.
3. **Local environment file** – Copy `.env.example` to `.env.local` and populate it using the credentials above. Running `npm run dev` locally should confirm the credentials are valid before attempting to deploy.
4. **Vercel CLI (optional but recommended)** – Install the CLI with `npm install -g vercel` if you want to trigger deployments or sync environment variables from your terminal.

## 2. Configure Vercel Environment Variables

In the Vercel dashboard for your project, add the following variables for the **Production**, **Preview**, and **Development** environments:

| Name | Description |
| ---- | ----------- |
| `DATABASE_URL` | PostgreSQL connection string including the `?schema=` query parameter. |
| `SHOPIFY_STORE_DOMAIN` | Shopify storefront domain. |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Storefront API token. |
| `SHOPIFY_STOREFRONT_API_VERSION` | Optional; defaults to `2024-04` if omitted. |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Admin API access token. |
| `SHOPIFY_ADMIN_API_VERSION` | Optional; defaults to `2024-07` if omitted. |
| `SHOPIFY_WEBHOOK_SECRET` | Webhook signing secret. |
| `REVIEW_ADMIN_EMAIL` | Email address authorised to moderate reviews. |
| `REVIEW_ADMIN_PASSWORD_HASH` | Admin password encoded as `sha256:<hex>` (use `echo -n "password" | sha256sum`). |
| `REVIEW_ADMIN_SECRET` | 32+ character secret used to sign admin sessions. |

Set `NEXT_TELEMETRY_DISABLED=1` if you prefer to disable telemetry during builds.

### Shopify webhook target

After the first deployment, configure the webhook endpoints inside the Shopify admin to point to your Vercel URL (for example `https://your-project.vercel.app/api/webhooks`). Use the `SHOPIFY_WEBHOOK_SECRET` defined above so webhook signatures validate correctly.

## 3. Trigger a Deployment

1. Push the repository to GitHub (or another Git provider supported by Vercel).
2. In Vercel, import the repository and ensure the following settings are applied (they are also codified in `vercel.json`):
   - **Framework Preset**: Next.js
   - **Install Command**: `npm install`
   - **Build Command**: `npm run prisma:deploy && npm run build`
   - **Output Directory**: `.next`
3. If you prefer the CLI, run `vercel` from the project root to link the repository and create the project. Once linked you can run `vercel --prod` for production deployments and `vercel` for previews.
4. Kick off a deployment. During the build step Vercel will:
   - Install dependencies and run `prisma generate` via `postinstall`.
   - Apply database migrations using `prisma migrate deploy`.
   - Build the Next.js application with `next build`.

Once complete, the site will be accessible at your Vercel-provided domain.

### Post-deployment checklist

- Visit the site to ensure the storefront renders and catalog data is loading from Shopify.
- Trigger a test storefront operation (e.g. view a product page) to confirm the Shopify Storefront API credentials work in production.
- In Shopify Admin, send a test webhook to confirm it is received by the `/api/webhooks` endpoint on Vercel.
- Promote the preview deployment to Production or re-run with `vercel --prod` once everything looks correct.

## 4. Seeding Data (Optional)

After the first deployment, you can seed initial catalog data by running the following command locally or from a separate environment where you can reach the production database:

```bash
DATABASE_URL="<production-database-url>" npm run seed
```

The seed script is idempotent and can be rerun safely.

---

If anything fails during deployment, check the Vercel build logs. Missing environment variables will cause the build to fail thanks to the runtime validation in `src/lib/env.ts`.

## 5. Rapid CSS iteration on Vercel

When you need to tweak styling and see the results quickly, combine Vercel preview deployments with the CLI:

1. **Link the project locally**
   ```bash
   npm install -g vercel
   vercel login
   vercel link
   ```
   The `vercel link` command associates your local checkout with the Vercel project so that deployments and environment variable syncs "just work".

2. **Pull environment variables for local previews**
   ```bash
   vercel env pull .env.local
   ```
   This mirrors the Production/Preview environment so that `npm run dev` and `vercel dev` run against the same configuration as the hosted app.

3. **Start a live-reload dev server**
   ```bash
   npm run dev
   # or, to run with Vercel's emulation layer
   vercel dev
   ```
   Next.js' Fast Refresh updates CSS instantly as you save changes. `vercel dev` is especially helpful when you want to verify serverless function behaviour locally before pushing.

4. **Push to a preview branch for teammates**
   - Commit your changes to a feature branch.
   - Push to GitHub; Vercel will create a Preview Deployment automatically.
   - Share the unique preview URL so others can see the updated styling.
   Preview deployments finish in ~1 minute and cache assets aggressively, so CSS changes show up quickly after each push.

5. **Optional: deploy straight from your terminal**
   ```bash
   npm run build
   vercel deploy --prebuilt
   ```
   The `--prebuilt` flag skips the remote build by reusing your local `.next` output, yielding near-instant preview deployments for rapid iteration. Use `--prod` to promote a change once you're happy with it.

Remember to keep database migrations in sync before deploying by running `npm run prisma:deploy`. If styling tweaks don't appear, clear your browser cache or append a query string to bypass cached assets.
