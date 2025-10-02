/**
 * Centralised runtime environment validation. This module is imported at the top
 * of every server-side entry point (for example the Prisma client singleton)
 * to ensure that critical configuration is present before any expensive work
 * happens. The goal is to fail fast in production – such as on Vercel – while
 * still providing helpful warnings during local development.
 */

type EnvKey =
  | 'DATABASE_URL'
  | 'SHOPIFY_STORE_DOMAIN'
  | 'SHOPIFY_STOREFRONT_ACCESS_TOKEN'
  | 'SHOPIFY_ADMIN_ACCESS_TOKEN'
  | 'SHOPIFY_WEBHOOK_SECRET';

const REQUIRED_ENV_VARS: EnvKey[] = [
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
];

function isMissing(value: string | undefined | null): value is undefined | null | '' {
  return value === undefined || value === null || value.length === 0;
}

const missing = REQUIRED_ENV_VARS.filter((key) => isMissing(process.env[key]));

if (missing.length > 0) {
  const message = `Missing required environment variables: ${missing.join(', ')}`;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(message);
  } else {
    // eslint-disable-next-line no-console -- surfaced during local development only
    console.warn(`\u26a0\ufe0f ${message}`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN ?? '',
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? '',
  SHOPIFY_STOREFRONT_API_VERSION: process.env.SHOPIFY_STOREFRONT_API_VERSION ?? '2024-04',
  SHOPIFY_ADMIN_ACCESS_TOKEN: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? '',
  SHOPIFY_ADMIN_API_VERSION: process.env.SHOPIFY_ADMIN_API_VERSION ?? '2024-07',
  SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET ?? '',
};

export type Env = typeof env;
