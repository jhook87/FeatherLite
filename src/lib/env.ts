// src/lib/env.ts
//
// Minimal environment validation to ensure core secrets are present during
// production builds. Importing this module has no exports but will throw an
// error if required variables are missing, preventing the application from
// starting with an invalid configuration.

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'SHOPIFY_STORE_DOMAIN',
  'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
  'SHOPIFY_ADMIN_ACCESS_TOKEN',
  'SHOPIFY_WEBHOOK_SECRET',
] as const;

if (process.env.SKIP_ENV_VALIDATION !== 'true') {
  const missing = REQUIRED_ENV_VARS.filter((name) => {
    const value = process.env[name];
    return value === undefined || value === '';
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
}

export {};
