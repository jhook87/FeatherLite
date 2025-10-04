# FeatherLite Production Launch Guide

This guide explains how to deploy the FeatherLite Makeup storefront to GoDaddy shared hosting using the cPanel Node.js runtime. Follow every step in order so that the production site at **https://featherlitemakeup.com** ships with a healthy database, verified Shopify integration, and hardened review moderation access.

---

## 1. Platform Overview

- **Runtime**: Node.js 18 (cPanel “Setup Node.js App”).
- **Framework**: Next.js with a custom `server.js` entry point that boots `next start` inside cPanel.
- **Database**: External PostgreSQL (Neon, Supabase, Railway, etc.) consumed through Prisma.
- **Commerce**: Shopify Storefront + Admin APIs.
- **Static assets**: Served from the app’s `public/` directory.

---

## 2. Required Environment Variables

Create your `.env.production` locally by copying `.env.example` and filling in the production credentials. The same values must later be entered into cPanel’s **Environment Variables** UI (no `.env` upload is supported on shared hosting).

| Variable | Purpose | Notes |
| --- | --- | --- |
| `DATABASE_URL` | External Postgres connection string | Include the `?schema=` query parameter Prisma expects. Test with `psql` before deploying. |
| `NEXT_PUBLIC_SITE_URL` | Canonical production origin | Set to `https://featherlitemakeup.com`. |
| `SHOPIFY_STORE_DOMAIN` | Shopify store domain | e.g. `featherlite-makeup.myshopify.com`. |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Storefront API token | Generated from your Shopify custom app. |
| `SHOPIFY_STOREFRONT_API_VERSION` | Optional override | Defaults to `2024-04` if omitted. |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Admin API token | Requires read/write permissions to Products, Orders, Inventory, Webhooks. |
| `SHOPIFY_ADMIN_API_VERSION` | Optional override | Defaults to `2024-07` if omitted. |
| `SHOPIFY_WEBHOOK_SECRET` | HMAC secret for webhooks | Must match the Shopify app webhook configuration. |
| `REVIEW_ADMIN_EMAIL` | Moderator login | Address used on `/admin/reviews/login`. |
| `REVIEW_ADMIN_PASSWORD_HASH` | SHA-256 hash of admin password | Format: `sha256:<hex>`. Use `echo -n "password" | sha256sum`. |
| `REVIEW_ADMIN_SECRET` | 32+ char session secret | Generate with `openssl rand -hex 24`. |
| `SKIP_ENV_VALIDATION` | Must remain `false` | Ensures `/api/status` stays accurate. |
| `NEXT_TELEMETRY_DISABLED` | Optional | Set to `1` if you wish to disable Next telemetry. |

Store an encrypted copy of this file offline together with the Prisma migration history for disaster recovery.

---

## 3. Pre-flight Validation (local workstation)

1. **Install dependencies**
   ```bash
   npm ci
   ```
2. **Apply migrations to the production database** (requires valid `DATABASE_URL`):
   ```bash
   npm run prisma:deploy
   ```
3. **Build the Next.js application**
   ```bash
   npm run build
   ```
4. **Seed production data (optional)** – only run if the external database needs the default content:
   ```bash
   npm run seed:prod
   ```
5. **Sanity check the status endpoint locally** (with production env vars loaded):
   ```bash
   npm run dev &
   curl http://localhost:3000/api/status
   ```
   Ensure the JSON response includes `"ready": true`. Stop the dev server after the check.

---

## 4. Build the Production Bundle

1. Clean any previous artifacts:
   ```bash
   rm -rf .next featherlite-prod node_modules
   ```
2. Reinstall dependencies and rebuild for production:
   ```bash
   npm ci
   npm run prisma:deploy
   npm run build
   ```
3. Compile the Prisma seed script:
   ```bash
   npm run build:seed
   ```
4. Install **production-only** dependencies into `node_modules`:
   ```bash
   npm ci --omit=dev
   ```
5. Gather the deployable assets:
   ```bash
   mkdir -p featherlite-prod
   cp -R .next public prisma package.json package-lock.json next.config.js server.js featherlite-prod/
   cp -R node_modules featherlite-prod/
   ```
6. Zip the bundle:
   ```bash
   cd featherlite-prod
   zip -r ../featherlite-prod.zip .
   cd ..
   ```
   Upload `featherlite-prod.zip` to cPanel.

---

## 5. Configure GoDaddy cPanel

1. **Upload** `featherlite-prod.zip` via cPanel’s File Manager and extract it into the desired application directory (e.g. `~/nodeapps/featherlite`).
2. Navigate to **Setup Node.js App**:
   - **Node.js version**: 18.x (latest available).
   - **Application mode**: Production.
   - **Application root**: directory where you extracted the bundle.
   - **Application startup file**: `server.js`.
3. Click **Create** (or **Update**) to provision the runtime.
4. Open the app’s detail page and add the environment variables from Section 2 using the **Environment Variables** form (one key/value at a time).
5. Run `npm ci --omit=dev` from the cPanel terminal (“Run NPM Install”) to ensure dependencies are installed in the hosting environment.
6. Press **Restart App**. The log should report `FeatherLite storefront ready on http://0.0.0.0:<port>` with no stack traces.

---

## 6. Domain & HTTPS

1. Point `featherlitemakeup.com` and `www.featherlitemakeup.com` A records to GoDaddy’s hosting IP (already handled if the domain is registered with GoDaddy). Allow DNS propagation.
2. In cPanel → **Domains**, map the domain to the Node.js application root (document root should match the app directory).
3. Enable SSL via **Security → SSL/TLS Status → Run AutoSSL**. Confirm that `featherlitemakeup.com` shows a green lock once provisioning completes.

---

## 7. Shopify Integration Checklist

1. In Shopify Admin → **Apps → Develop apps**, confirm the custom app tokens used in Section 2.
2. Test Storefront API from your workstation:
   ```bash
   curl -H "X-Shopify-Storefront-Access-Token: $SHOPIFY_STOREFRONT_ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        https://$SHOPIFY_STORE_DOMAIN/api/2024-04/graphql.json \
        -d '{"query":"{ shop { name } }"}'
   ```
3. Test Admin API (requires private app token):
   ```bash
   curl -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_ACCESS_TOKEN" \
        https://$SHOPIFY_STORE_DOMAIN/admin/api/2024-07/products/count.json
   ```
4. Configure Shopify webhooks:
   - **URL**: `https://featherlitemakeup.com/api/webhooks`
   - **Webhook API version**: match `SHOPIFY_ADMIN_API_VERSION`.
   - **Secret**: same as `SHOPIFY_WEBHOOK_SECRET`.
   - Send a test webhook from Shopify and confirm a `200 OK` response in Shopify and the cPanel app logs.

---

## 8. Post-deployment Validation

Run the following checks after every release:

1. **Status endpoint**
   ```bash
   curl https://featherlitemakeup.com/api/status
   ```
   Expect `{ "summary": { "ready": true, ... } }`.
2. **Smoke test the storefront**
   - Home, collection, and product detail pages render without console errors.
   - Shopify products, images, and pricing load dynamically.
   - Crimson Pro & Josefin Sans fonts load (verify in dev tools → Network → Fonts).
   - Skip links and keyboard navigation function on focus.
3. **Review moderation**
   - Visit `https://featherlitemakeup.com/admin/reviews/login`.
   - Sign in with `REVIEW_ADMIN_EMAIL` and the plaintext password that matches `REVIEW_ADMIN_PASSWORD_HASH`.
4. **Logs** – check cPanel → **Application Logs** for 500s, Prisma errors, or webhook signature failures.
5. **Lighthouse** – run Lighthouse (Chrome DevTools) against the production URL and confirm Performance and SEO scores are ≥ 90.

---

## 9. Backups & Monitoring

- **Database**: Configure automatic backups in your Postgres provider (daily minimum; hourly preferred during launch week). Retain at least 7 days of snapshots.
- **Logs**: Enable log retention/rotation in cPanel (Preferences → Application Logs). Download weekly to archive.
- **Secrets archive**: Store the production `.env.production`, Prisma migrations (`prisma/migrations`), and Shopify app credentials in a secure password manager or encrypted vault.
- **Alerting**: Optional – set up Shopify webhook failure notifications and database monitoring alerts for connection spikes or storage limits.

---

## 10. Quick Reference Commands

```bash
# Apply Prisma migrations against production
npm run prisma:deploy

# Build Next.js for production
npm run build

# Package production bundle
npm ci --omit=dev
zip -r featherlite-prod.zip .next public prisma package.json package-lock.json node_modules next.config.js server.js

# Verify readiness
curl https://featherlitemakeup.com/api/status
```

Keep this document updated as the hosting environment evolves. When in doubt, re-run the `/api/status` check before declaring the launch complete.
