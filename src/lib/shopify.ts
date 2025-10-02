import Client from 'shopify-buy';
import { createAdminRestApiClient } from '@shopify/admin-api-client';

export const shopifyConfig = {
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN ?? '',
  storefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? '',
  storefrontApiVersion: process.env.SHOPIFY_STOREFRONT_API_VERSION ?? '2024-04',
  adminAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? '',
  adminApiVersion: process.env.SHOPIFY_ADMIN_API_VERSION ?? '2024-07',
  webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET ?? '',
};

type ShopifyBuyClient = ReturnType<typeof Client.buildClient>;
let buyClient: ShopifyBuyClient | null = null;

function ensureStorefrontConfigured() {
  if (!shopifyConfig.storeDomain || !shopifyConfig.storefrontAccessToken) {
    throw new Error('Shopify storefront credentials are not configured.');
  }
}

function ensureAdminConfigured() {
  if (!shopifyConfig.storeDomain || !shopifyConfig.adminAccessToken) {
    throw new Error('Shopify admin credentials are not configured.');
  }
}

export function getShopifyBuyClient(): ShopifyBuyClient {
  ensureStorefrontConfigured();
  if (!buyClient) {
    buyClient = Client.buildClient({
      domain: shopifyConfig.storeDomain,
      storefrontAccessToken: shopifyConfig.storefrontAccessToken,
      apiVersion: shopifyConfig.storefrontApiVersion,
    });
  }
  return buyClient;
}

type AdminClient = ReturnType<typeof createAdminRestApiClient>;
let adminClient: AdminClient | null = null;

export function getShopifyAdminClient(): AdminClient {
  ensureAdminConfigured();
  if (!adminClient) {
    adminClient = createAdminRestApiClient({
      storeDomain: shopifyConfig.storeDomain,
      apiVersion: shopifyConfig.adminApiVersion,
      accessToken: shopifyConfig.adminAccessToken,
    });
  }
  return adminClient;
}

type GraphQLVariables = Record<string, unknown>;

type StorefrontResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

async function storefrontFetch<T>(query: string, variables?: GraphQLVariables): Promise<T> {
  ensureStorefrontConfigured();
  const res = await fetch(`https://${shopifyConfig.storeDomain}/api/${shopifyConfig.storefrontApiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': shopifyConfig.storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Shopify storefront request failed with status ${res.status}`);
  }

  const json = (await res.json()) as StorefrontResponse<T>;
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors.map((err) => err.message).join(', '));
  }
  if (!json.data) {
    throw new Error('Shopify storefront response did not include data.');
  }
  return json.data;
}

export type CartLineInput = {
  merchandiseId: string;
  quantity: number;
};

export type CartLineUpdateInput = {
  id: string;
  quantity: number;
};

export type NormalizedCartItem = {
  id: string;
  merchandiseId: string;
  title: string;
  quantity: number;
  sku: string | null;
  lineTotalCents: number;
  unitPriceCents: number;
  currencyCode: string;
};

export type NormalizedCart = {
  id: string;
  checkoutUrl: string | null;
  items: NormalizedCartItem[];
  subtotalCents: number;
  currencyCode: string;
};

type CartFragment = {
  id: string;
  checkoutUrl: string | null;
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    } | null;
  } | null;
  lines: {
    edges: {
      node: {
        id: string;
        quantity: number;
        cost: {
          totalAmount: {
            amount: string;
            currencyCode: string;
          } | null;
        } | null;
        merchandise: {
          id: string;
          sku?: string | null;
          title?: string | null;
          product?: {
            title?: string | null;
          } | null;
        } | null;
      };
    }[];
  } | null;
};

function normalizeCart(cart: CartFragment | null | undefined): NormalizedCart | null {
  if (!cart) {
    return null;
  }

  const edges = cart.lines?.edges ?? [];
  const items: NormalizedCartItem[] = edges.map((edge) => {
    const node = edge.node;
    const quantity = Number(node.quantity) || 0;
    const totalAmount = Number.parseFloat(node.cost?.totalAmount?.amount ?? '0');
    const currencyCode = node.cost?.totalAmount?.currencyCode ?? 'USD';
    const merchandise = node.merchandise;
    const productTitle = merchandise?.product?.title ?? '';
    const variantTitle = merchandise?.title && merchandise.title !== 'Default Title'
      ? ` – ${merchandise.title}`
      : '';
    const title = productTitle
      ? `${productTitle}${variantTitle}`
      : merchandise?.title ?? 'Unknown item';

    const lineTotalCents = Math.round((Number.isFinite(totalAmount) ? totalAmount : 0) * 100);
    const unitPriceCents = quantity > 0 ? Math.round(lineTotalCents / quantity) : 0;

    return {
      id: node.id,
      merchandiseId: merchandise?.id ?? '',
      title,
      quantity,
      sku: merchandise?.sku ?? null,
      lineTotalCents,
      unitPriceCents,
      currencyCode,
    };
  });

  const subtotalAmount = Number.parseFloat(cart.cost?.subtotalAmount?.amount ?? '0');
  const currencyCode = cart.cost?.subtotalAmount?.currencyCode ?? items[0]?.currencyCode ?? 'USD';

  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl ?? null,
    items,
    subtotalCents: Math.round((Number.isFinite(subtotalAmount) ? subtotalAmount : 0) * 100),
    currencyCode,
  };
}

const CART_FIELDS = `
  id
  checkoutUrl
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 250) {
    edges {
      node {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            sku
            title
            product {
              title
            }
          }
        }
      }
    }
  }
`;

export async function createCart(lines: CartLineInput[]): Promise<NormalizedCart> {
  const data = await storefrontFetch<{
    cartCreate: {
      cart: CartFragment | null;
      userErrors: { message: string }[];
    };
  }>(
    `mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          ${CART_FIELDS}
        }
        userErrors {
          message
        }
      }
    }`,
    { input: { lines } }
  );

  const errors = data.cartCreate.userErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors.map((err) => err.message).join(', '));
  }

  const cart = normalizeCart(data.cartCreate.cart);
  if (!cart) {
    throw new Error('Failed to create cart in Shopify.');
  }
  return cart;
}

export async function addLinesToCart(cartId: string, lines: CartLineInput[]): Promise<NormalizedCart> {
  const data = await storefrontFetch<{
    cartLinesAdd: {
      cart: CartFragment | null;
      userErrors: { message: string }[];
    };
  }>(
    `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FIELDS}
        }
        userErrors {
          message
        }
      }
    }`,
    { cartId, lines }
  );

  const errors = data.cartLinesAdd.userErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors.map((err) => err.message).join(', '));
  }

  const cart = normalizeCart(data.cartLinesAdd.cart);
  if (!cart) {
    throw new Error('Failed to add lines to cart.');
  }
  return cart;
}

export async function updateCartLines(cartId: string, lines: CartLineUpdateInput[]): Promise<NormalizedCart> {
  const data = await storefrontFetch<{
    cartLinesUpdate: {
      cart: CartFragment | null;
      userErrors: { message: string }[];
    };
  }>(
    `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FIELDS}
        }
        userErrors {
          message
        }
      }
    }`,
    { cartId, lines }
  );

  const errors = data.cartLinesUpdate.userErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors.map((err) => err.message).join(', '));
  }

  const cart = normalizeCart(data.cartLinesUpdate.cart);
  if (!cart) {
    throw new Error('Failed to update cart lines.');
  }
  return cart;
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<NormalizedCart> {
  const data = await storefrontFetch<{
    cartLinesRemove: {
      cart: CartFragment | null;
      userErrors: { message: string }[];
    };
  }>(
    `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ${CART_FIELDS}
        }
        userErrors {
          message
        }
      }
    }`,
    { cartId, lineIds }
  );

  const errors = data.cartLinesRemove.userErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors.map((err) => err.message).join(', '));
  }

  const cart = normalizeCart(data.cartLinesRemove.cart);
  if (!cart) {
    throw new Error('Failed to remove cart lines.');
  }
  return cart;
}

export async function fetchCart(cartId: string): Promise<NormalizedCart | null> {
  const data = await storefrontFetch<{
    cart: CartFragment | null;
  }>(
    `query cartQuery($cartId: ID!) {
      cart(id: $cartId) {
        ${CART_FIELDS}
      }
    }`,
    { cartId }
  );
  return normalizeCart(data.cart);
}

export async function fetchShopifyProducts() {
  const client = getShopifyAdminClient();
  const response = await client.get('products', {
    searchParams: {
      limit: 250,
    },
  });
  const body = (await response.json()) as { products?: any[] };
  return body.products ?? [];
}

export async function fetchShopifyOrders() {
  const client = getShopifyAdminClient();
  const response = await client.get('orders', {
    searchParams: {
      status: 'any',
      limit: 250,
    },
  });
  const body = (await response.json()) as { orders?: any[] };
  return body.orders ?? [];
}

