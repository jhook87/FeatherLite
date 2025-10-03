/**
 * Centralised runtime environment validation. This module is imported at the top
 * of every server-side entry point (for example the Prisma client singleton)
 * to ensure that critical configuration is present before any expensive work
 * happens. The goal is to fail fast in production – such as on Vercel – while
 * still providing helpful warnings during local development.
 */

import { z } from 'zod';

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

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL is required')
      .refine((value) => {
        if (value.startsWith('file:')) return true;
        try {
          // eslint-disable-next-line no-new -- URL constructor validates format
          new URL(value);
          return true;
        } catch (error) {
          return false;
        }
      }, 'DATABASE_URL must be a valid connection string'),
    SHOPIFY_STORE_DOMAIN: z.string().min(1, 'SHOPIFY_STORE_DOMAIN is required'),
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: z
      .string()
      .min(1, 'SHOPIFY_STOREFRONT_ACCESS_TOKEN is required'),
    SHOPIFY_STOREFRONT_API_VERSION: z
      .string()
      .regex(/^20\d{2}-\d{2}$/u, 'SHOPIFY_STOREFRONT_API_VERSION must follow YYYY-MM format')
      .default('2024-04'),
    SHOPIFY_ADMIN_ACCESS_TOKEN: z
      .string()
      .min(1, 'SHOPIFY_ADMIN_ACCESS_TOKEN is required'),
    SHOPIFY_ADMIN_API_VERSION: z
      .string()
      .regex(/^20\d{2}-\d{2}$/u, 'SHOPIFY_ADMIN_API_VERSION must follow YYYY-MM format')
      .default('2024-07'),
    SHOPIFY_WEBHOOK_SECRET: z.string().min(1, 'SHOPIFY_WEBHOOK_SECRET is required'),
    REVIEW_ADMIN_EMAIL: z.string().email('REVIEW_ADMIN_EMAIL must be a valid email address'),
    REVIEW_ADMIN_PASSWORD_HASH: z
      .string()
      .regex(
        /^\$2[aby]\$.{56}$/u,
        'REVIEW_ADMIN_PASSWORD_HASH must be a bcrypt hash (cost 04-31)'
      ),
    REVIEW_ADMIN_SECRET: z
      .string()
      .min(32, 'REVIEW_ADMIN_SECRET must be at least 32 characters long'),
  })
  .transform((value) => ({
    ...value,
    SHOPIFY_STORE_DOMAIN: value.SHOPIFY_STORE_DOMAIN.trim(),
  }));

type EnvSchema = z.infer<typeof envSchema>;

const shouldSkipValidation = process.env.SKIP_ENV_VALIDATION === 'true';
const parsedEnv = envSchema.safeParse(rawEnv);

function formatValidationErrors(error: z.ZodError<EnvSchema>): string {
  return error.errors
    .map((err) => `${err.path.join('.') || '<root>'}: ${err.message}`)
    .join('; ');
}

if (!parsedEnv.success) {
  const message = `Invalid environment configuration: ${formatValidationErrors(parsedEnv.error)}`;
  if (!shouldSkipValidation && rawEnv.NODE_ENV === 'production') {
    throw new Error(message);
  }
  // eslint-disable-next-line no-console -- surfaced during local development or when validation is skipped
  console.warn(`\u26a0\ufe0f ${message}`);
}

export const env: EnvSchema = parsedEnv.success
  ? parsedEnv.data
  : {
      NODE_ENV: rawEnv.NODE_ENV === 'development' || rawEnv.NODE_ENV === 'production' || rawEnv.NODE_ENV === 'test' 
        ? rawEnv.NODE_ENV 
        : 'development',
      DATABASE_URL: rawEnv.DATABASE_URL ?? '',
      SHOPIFY_STORE_DOMAIN: rawEnv.SHOPIFY_STORE_DOMAIN?.trim() ?? '',
      SHOPIFY_STOREFRONT_ACCESS_TOKEN: rawEnv.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? '',
      SHOPIFY_STOREFRONT_API_VERSION: rawEnv.SHOPIFY_STOREFRONT_API_VERSION ?? '2024-04',
      SHOPIFY_ADMIN_ACCESS_TOKEN: rawEnv.SHOPIFY_ADMIN_ACCESS_TOKEN ?? '',
      SHOPIFY_ADMIN_API_VERSION: rawEnv.SHOPIFY_ADMIN_API_VERSION ?? '2024-07',
      SHOPIFY_WEBHOOK_SECRET: rawEnv.SHOPIFY_WEBHOOK_SECRET ?? '',
      REVIEW_ADMIN_EMAIL: rawEnv.REVIEW_ADMIN_EMAIL ?? '',
      REVIEW_ADMIN_PASSWORD_HASH: rawEnv.REVIEW_ADMIN_PASSWORD_HASH ?? '',
      REVIEW_ADMIN_SECRET: rawEnv.REVIEW_ADMIN_SECRET ?? '',
    };

export type Env = typeof env;
