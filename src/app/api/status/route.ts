export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { isShopifyAdminConfigured, isShopifyStorefrontConfigured } from '@/lib/shopify';

const STATUS_DEFINITIONS = [
  {
    id: 'database',
    label: 'Database connection',
    configured: () => Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim()),
    help: 'Set DATABASE_URL to your PostgreSQL connection string including the ?schema parameter.',
    category: 'platform' as const,
  },
  {
    id: 'reviewAdmin',
    label: 'Review admin access',
    configured: () =>
      Boolean(
        env.REVIEW_ADMIN_EMAIL &&
          env.REVIEW_ADMIN_PASSWORD_HASH &&
          env.REVIEW_ADMIN_SECRET &&
          env.REVIEW_ADMIN_SECRET.length >= 32
      ),
    help: 'Populate REVIEW_ADMIN_EMAIL, REVIEW_ADMIN_PASSWORD_HASH and REVIEW_ADMIN_SECRET so moderation login works.',
    category: 'platform' as const,
  },
  {
    id: 'shopifyStorefront',
    label: 'Shopify Storefront API',
    configured: () => isShopifyStorefrontConfigured(),
    help: 'Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN to load live catalog data.',
    category: 'shopify' as const,
  },
  {
    id: 'shopifyAdmin',
    label: 'Shopify Admin API',
    configured: () => isShopifyAdminConfigured(),
    help: 'Set SHOPIFY_ADMIN_ACCESS_TOKEN to enable product and order syncing.',
    category: 'shopify' as const,
  },
  {
    id: 'shopifyWebhooks',
    label: 'Shopify webhooks',
    configured: () => Boolean(env.SHOPIFY_WEBHOOK_SECRET),
    help: 'Set SHOPIFY_WEBHOOK_SECRET to verify webhooks from your Shopify admin app.',
    category: 'shopify' as const,
  },
] as const;

type StatusDefinition = (typeof STATUS_DEFINITIONS)[number];

type StatusResponse = {
  id: StatusDefinition['id'];
  label: string;
  category: StatusDefinition['category'];
  configured: boolean;
  help: string;
};

export async function GET() {
  const statuses: StatusResponse[] = STATUS_DEFINITIONS.map((definition) => ({
    id: definition.id,
    label: definition.label,
    category: definition.category,
    configured: definition.configured(),
    help: definition.help,
  }));

  const pending = statuses.filter((status) => !status.configured);
  const summary = {
    ready: pending.length === 0,
    pending: pending.map((status) => status.id),
    shopifyReady: pending.every((status) => status.category !== 'shopify'),
  };

  return NextResponse.json({ statuses, summary });
}
