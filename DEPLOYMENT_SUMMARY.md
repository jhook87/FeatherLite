# FeatherLite Production Deployment Snapshot

Use this one-page reference while promoting https://featherlitemakeup.com on GoDaddy shared hosting.

## Core Environment
- **Runtime**: Node.js 18 (cPanel Node.js App)
- **Database**: External Postgres (Neon/Supabase/Railway) – migrations applied with `npm run prisma:deploy`
- **Framework**: Next.js 14 with custom `server.js`
- **Bundle contents**: `.next/`, `public/`, `prisma/`, `node_modules/` (prod), `package.json`, `package-lock.json`, `next.config.js`, `server.js`

## Required Env Vars (cPanel → Environment Variables)
| Key | Value Example | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://featherlitemakeup.com` | Must match production origin |
| `DATABASE_URL` | `postgresql://user:pass@host/db?schema=public` | External Postgres only |
| `SHOPIFY_STORE_DOMAIN` | `featherlite-makeup.myshopify.com` | No protocol |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | `shpat_***` | Storefront API token |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | `shpca_***` | Admin API token |
| `SHOPIFY_WEBHOOK_SECRET` | `whsec_***` | Match Shopify webhook config |
| `REVIEW_ADMIN_EMAIL` | `moderator@featherlite.com` | Login on `/admin/reviews/login` |
| `REVIEW_ADMIN_PASSWORD_HASH` | `sha256:...` | `echo -n "password" | sha256sum` |
| `REVIEW_ADMIN_SECRET` | `32+ char secret` | `openssl rand -hex 24` |
| `SKIP_ENV_VALIDATION` | `false` | Keeps `/api/status` accurate |

## Local Build Checklist
1. `npm ci`
2. `npm run prisma:deploy`
3. `npm run build`
4. `npm run seed:prod` *(optional, only for initial seed)*
5. `npm ci --omit=dev`
6. Package zip:
   ```bash
   mkdir -p featherlite-prod
   cp -R .next public prisma node_modules package.json package-lock.json next.config.js server.js featherlite-prod/
   (cd featherlite-prod && zip -r ../featherlite-prod.zip .)
   ```

## cPanel Actions
1. Upload & extract `featherlite-prod.zip` into app directory.
2. Setup Node.js App → Node 18, production mode, startup file `server.js`.
3. Add environment variables individually.
4. Run `npm ci --omit=dev` via “Run NPM Install”.
5. Restart the app and confirm log output: `FeatherLite storefront ready on http://0.0.0.0:<port>`.

## Domain & SSL
- Map `featherlitemakeup.com` to the Node app directory.
- Run AutoSSL and verify HTTPS lock in browser.

## Shopify + API Tests
- Storefront GraphQL ping: `curl https://$SHOPIFY_STORE_DOMAIN/api/2024-04/graphql.json ...`
- Admin REST ping: `curl https://$SHOPIFY_STORE_DOMAIN/admin/api/2024-07/products/count.json ...`
- Webhook test from Shopify → expect `200 OK` at `/api/webhooks`.

## Post-launch Validation
- `curl https://featherlitemakeup.com/api/status` → `ready: true`
- Navigate storefront pages for live product data and font loading.
- Review admin login succeeds.
- Lighthouse (Chrome DevTools) Performance & SEO ≥ 90.

## Operations
- Schedule automated Postgres backups (hourly launch week, daily afterwards).
- Enable cPanel log retention/rotation.
- Store `.env.production` + `prisma/migrations` in a secure vault.
