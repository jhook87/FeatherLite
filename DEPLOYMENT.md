# FeatherLite Deployment Guide

This project is configured for deployment on [Vercel](https://vercel.com/). The configuration ensures that Prisma migrations are applied automatically during the build step and that all required environment variables are validated at runtime.

## 1. Prerequisites

1. Create a PostgreSQL database (Neon, Supabase, Railway, RDS, etc.).
2. Gather your Shopify credentials:
   - Store domain (e.g. `your-shop.myshopify.com`)
   - Storefront access token
   - Admin access token
   - Webhook signing secret
3. Copy `.env.example` to `.env.local` (for local development) and fill in the values.

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

Set `NEXT_TELEMETRY_DISABLED=1` if you prefer to disable telemetry during builds.

## 3. Trigger a Deployment

1. Push the repository to GitHub.
2. In Vercel, import the repository and ensure the following settings are applied (they are also codified in `vercel.json`):
   - **Framework Preset**: Next.js
   - **Install Command**: `npm install`
   - **Build Command**: `npm run prisma:deploy && npm run build`
   - **Output Directory**: `.next`
3. Kick off a deployment. During the build step Vercel will:
   - Install dependencies and run `prisma generate` via `postinstall`.
   - Apply database migrations using `prisma migrate deploy`.
   - Build the Next.js application with `next build`.

Once complete, the site will be accessible at your Vercel-provided domain.

## 4. Seeding Data (Optional)

After the first deployment, you can seed initial catalog data by running the following command locally or from a separate environment where you can reach the production database:

```bash
DATABASE_URL="<production-database-url>" npm run seed
```

The seed script is idempotent and can be rerun safely.

---

If anything fails during deployment, check the Vercel build logs. Missing environment variables will cause the build to fail thanks to the runtime validation in `src/lib/env.ts`.
