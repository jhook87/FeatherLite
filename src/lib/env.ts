/**
 * Centralised runtime environment validation. This module is imported at the top
 * of every server-side entry point (for example the Prisma client singleton)
 * to ensure that critical configuration is present before any expensive work
 * happens. The goal is to fail fast in production – such as on Vercel – while
 * still providing helpful warnings during local development.
 */

const rawEnv = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  SHOPIFY_STOREFRONT_API_VERSION: process.env.SHOPIFY_STOREFRONT_API_VERSION,
  SHOPIFY_ADMIN_ACCESS_TOKEN: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  SHOPIFY_ADMIN_API_VERSION: process.env.SHOPIFY_ADMIN_API_VERSION,
  SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET,
  REVIEW_ADMIN_EMAIL: process.env.REVIEW_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL,
  REVIEW_ADMIN_PASSWORD_HASH:
    process.env.REVIEW_ADMIN_PASSWORD_HASH ?? process.env.ADMIN_PASSWORD_HASH,
  REVIEW_ADMIN_SECRET: process.env.REVIEW_ADMIN_SECRET ?? process.env.NEXTAUTH_SECRET,
};

const errors: string[] = [];

function parseNodeEnv(value: string | undefined | null) {
  if (value === 'development' || value === 'production' || value === 'test') {
    return value;
  }
  return 'development';
}

function requireString(name: string, value: string | undefined | null) {
  if (!value) {
    errors.push(`${name} is required`);
    return '';
  }
  return value;
}

function requireUrl(name: string, value: string | undefined | null) {
  const stringValue = requireString(name, value);
  if (!stringValue) {
    return '';
  }

  if (stringValue.startsWith('file:')) {
    return stringValue;
  }

  try {
    // eslint-disable-next-line no-new -- URL constructor validates format
    new URL(stringValue);
  } catch (error) {
    errors.push(`${name} must be a valid connection string`);
  }
  return stringValue;
}

function requireApiVersion(name: string, value: string | undefined | null, fallback: string) {
  const stringValue = (value && value.trim()) || fallback;
  if (!/^20\d{2}-\d{2}$/.test(stringValue)) {
    errors.push(`${name} must follow YYYY-MM format`);
  }
  return stringValue;
}

function requireEmail(name: string, value: string | undefined | null) {
  const stringValue = requireString(name, value?.trim());
  if (!stringValue) {
    return '';
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(stringValue)) {
    errors.push(`${name} must be a valid email address`);
  }
  return stringValue;
}

function requirePasswordHash(name: string, value: string | undefined | null) {
  const stringValue = requireString(name, value?.trim());
  if (!stringValue) {
    return '';
  }

  if (stringValue.startsWith('sha256:')) {
    const digest = stringValue.slice('sha256:'.length);
    if (!/^[a-f0-9]{64}$/i.test(digest)) {
      errors.push(`${name} must contain a hexadecimal SHA-256 digest after "sha256:"`);
    }
    return stringValue;
  }

  if (stringValue.startsWith('plain:')) {
    if (stringValue.length <= 'plain:'.length) {
      errors.push(`${name} must include a password after "plain:"`);
    }
    return stringValue;
  }

  errors.push(`${name} must be prefixed with "sha256:" or "plain:"`);
  return stringValue;
}

const parsedEnv = {
  NODE_ENV: parseNodeEnv(rawEnv.NODE_ENV),
  DATABASE_URL: requireUrl('DATABASE_URL', rawEnv.DATABASE_URL),
  SHOPIFY_STORE_DOMAIN: requireString('SHOPIFY_STORE_DOMAIN', rawEnv.SHOPIFY_STORE_DOMAIN)?.trim() ?? '',
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: requireString(
    'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
    rawEnv.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  ),
  SHOPIFY_STOREFRONT_API_VERSION: requireApiVersion(
    'SHOPIFY_STOREFRONT_API_VERSION',
    rawEnv.SHOPIFY_STOREFRONT_API_VERSION,
    '2024-04'
  ),
  SHOPIFY_ADMIN_ACCESS_TOKEN: requireString('SHOPIFY_ADMIN_ACCESS_TOKEN', rawEnv.SHOPIFY_ADMIN_ACCESS_TOKEN),
  SHOPIFY_ADMIN_API_VERSION: requireApiVersion(
    'SHOPIFY_ADMIN_API_VERSION',
    rawEnv.SHOPIFY_ADMIN_API_VERSION,
    '2024-07'
  ),
  SHOPIFY_WEBHOOK_SECRET: requireString('SHOPIFY_WEBHOOK_SECRET', rawEnv.SHOPIFY_WEBHOOK_SECRET),
  REVIEW_ADMIN_EMAIL: requireEmail('REVIEW_ADMIN_EMAIL', rawEnv.REVIEW_ADMIN_EMAIL),
  REVIEW_ADMIN_PASSWORD_HASH: requirePasswordHash(
    'REVIEW_ADMIN_PASSWORD_HASH',
    rawEnv.REVIEW_ADMIN_PASSWORD_HASH
  ),
  REVIEW_ADMIN_SECRET: (() => {
    const value = requireString('REVIEW_ADMIN_SECRET', rawEnv.REVIEW_ADMIN_SECRET);
    if (value && value.length < 32) {
      errors.push('REVIEW_ADMIN_SECRET must be at least 32 characters long');
    }
    return value;
  })(),
};

const shouldSkipValidation = process.env.SKIP_ENV_VALIDATION === 'true';
const enforceInProduction = !shouldSkipValidation && parsedEnv.NODE_ENV === 'production' && process.env.VERCEL === '1';

if (errors.length > 0) {
  const message = `Invalid environment configuration: ${errors.join('; ')}`;
  if (enforceInProduction) {
    throw new Error(message);
  }
  // eslint-disable-next-line no-console -- surfaced during local development or when validation is skipped
  console.warn(`\u26a0\ufe0f ${message}`);
}

export const env = parsedEnv;
export type Env = typeof env;
