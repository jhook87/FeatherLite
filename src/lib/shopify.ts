import { randomUUID } from 'crypto';
import Client from 'shopify-buy';
import { createAdminRestApiClient } from '@shopify/admin-api-client';
import {
  getDummyProducts,
  getDummyVariantByShopifyId,
  getDummyVariantCatalog,
} from '@/lib/dummyContent';

export const shopifyConfig = {
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN ?? '',
  storefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? '',
  storefrontApiVersion: process.env.SHOPIFY_STOREFRONT_API_VERSION ?? '2024-04',
  adminAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? '',
  adminApiVersion: process.env.SHOPIFY_ADMIN_API_VERSION ?? '2024-07',
  webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET ?? '',
};

const storefrontConfigured = Boolean(
  shopifyConfig.storeDomain && shopifyConfig.storefrontAccessToken
);
const adminConfigured = Boolean(shopifyConfig.storeDomain && shopifyConfig.adminAccessToken);

export function isShopifyStorefrontConfigured() {
  return storefrontConfigured;
}

export function isShopifyAdminConfigured() {
  return adminConfigured;
}

export function isShopifyConfigured() {
  return storefrontConfigured && adminConfigured;
}

type ShopifyBuyClient = ReturnType<typeof Client.buildClient>;
let buyClient: ShopifyBuyClient | null = null;

function ensureStorefrontConfigured() {
  if (!isShopifyStorefrontConfigured()) {
    throw new Error('Shopify storefront credentials are not configured.');
  }
}

function ensureAdminConfigured() {
  if (!isShopifyAdminConfigured()) {
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

const MOCK_CHECKOUT_BASE_URL = 'https://checkout.featherlite.test';

type MockCartLine = {
  id: string;
  merchandiseId: string;
  title: string;
  sku: string | null;
  quantity: number;
  unitPriceCents: number;
  currencyCode: string;
};

type MockCart = {
  id: string;
  lines: MockCartLine[];
  checkoutUrl: string;
  currencyCode: string;
};

const mockCarts = new Map<string, MockCart>();

function getVariantInfo(merchandiseId: string) {
  const match = getDummyVariantByShopifyId(merchandiseId);
  if (match) {
    const titleSuffix = match.variant.name && match.variant.name !== 'Default' ? ` – ${match.variant.name}` : '';
    return {
      title: `${match.product.name}${titleSuffix}`,
      sku: match.variant.sku,
      priceCents: match.variant.priceCents,
      currencyCode: 'USD',
    };
  }
  return {
    title: 'FeatherLite Sample Item',
    sku: null,
    priceCents: 2800,
    currencyCode: 'USD',
  };
}

function ensureMockCart(cartId: string): MockCart {
  const cart = mockCarts.get(cartId);
  if (!cart) {
    throw new Error('Cart not found');
  }
  return cart;
}

function toNormalizedMockCart(cart: MockCart): NormalizedCart {
  const items: NormalizedCartItem[] = cart.lines.map((line) => ({
    id: line.id,
    merchandiseId: line.merchandiseId,
    title: line.title,
    quantity: line.quantity,
    sku: line.sku,
    lineTotalCents: line.unitPriceCents * line.quantity,
    unitPriceCents: line.unitPriceCents,
    currencyCode: line.currencyCode,
  }));
  const subtotalCents = items.reduce((total, item) => total + item.lineTotalCents, 0);
  const currencyCode = items[0]?.currencyCode ?? cart.currencyCode;
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    items,
    subtotalCents,
    currencyCode,
  };
}

function addMockLine(cart: MockCart, merchandiseId: string, quantity: number) {
  if (quantity <= 0) return;
  const info = getVariantInfo(merchandiseId);
  const existing = cart.lines.find((line) => line.merchandiseId === merchandiseId);
  if (existing) {
    existing.quantity += quantity;
    existing.unitPriceCents = info.priceCents;
    existing.currencyCode = info.currencyCode;
  } else {
    cart.lines.push({
      id: randomUUID(),
      merchandiseId,
      title: info.title,
      sku: info.sku,
      quantity,
      unitPriceCents: info.priceCents,
      currencyCode: info.currencyCode,
    });
  }
}

function mockCreateCart(lines: CartLineInput[]): NormalizedCart {
  const id = randomUUID();
  const cart: MockCart = {
    id,
    lines: [],
    checkoutUrl: `${MOCK_CHECKOUT_BASE_URL}/${id}`,
    currencyCode: 'USD',
  };
  mockCarts.set(id, cart);
  for (const line of lines) {
    addMockLine(cart, line.merchandiseId, line.quantity);
  }
  return toNormalizedMockCart(cart);
}

function mockAddLines(cartId: string, lines: CartLineInput[]): NormalizedCart {
  const cart = ensureMockCart(cartId);
  for (const line of lines) {
    addMockLine(cart, line.merchandiseId, line.quantity);
  }
  return toNormalizedMockCart(cart);
}

function mockUpdateLines(cartId: string, lines: CartLineUpdateInput[]): NormalizedCart {
  const cart = ensureMockCart(cartId);
  for (const line of lines) {
    const existing = cart.lines.find((item) => item.id === line.id);
    if (!existing) continue;
    if (line.quantity <= 0) {
      cart.lines = cart.lines.filter((item) => item.id !== line.id);
      continue;
    }
    existing.quantity = line.quantity;
  }
  return toNormalizedMockCart(cart);
}

function mockRemoveLines(cartId: string, lineIds: string[]): NormalizedCart {
  const cart = ensureMockCart(cartId);
  cart.lines = cart.lines.filter((line) => !lineIds.includes(line.id));
  return toNormalizedMockCart(cart);
}

function mockFetchCart(cartId: string): NormalizedCart | null {
  const cart = mockCarts.get(cartId);
  return cart ? toNormalizedMockCart(cart) : null;
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
  if (!isShopifyStorefrontConfigured()) {
    return mockCreateCart(lines);
  }
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
  if (!isShopifyStorefrontConfigured()) {
    return mockAddLines(cartId, lines);
  }
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
  if (!isShopifyStorefrontConfigured()) {
    return mockUpdateLines(cartId, lines);
  }
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
  if (!isShopifyStorefrontConfigured()) {
    return mockRemoveLines(cartId, lineIds);
  }
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
  if (!isShopifyStorefrontConfigured()) {
    return mockFetchCart(cartId);
  }
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
  if (!isShopifyAdminConfigured()) {
    return getDummyProducts().map((product) => ({
      id: product.id,
      title: product.name,
      body_html: `<p>${product.description}</p>`,
      product_type: product.kind,
      status: 'active',
      variants: product.variants.map((variant) => ({
        id: variant.shopifyVariantId,
        title: variant.name,
        price: (variant.priceCents / 100).toFixed(2),
        sku: variant.sku,
        inventory_quantity: 50,
      })),
    }));
  }
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
  if (!isShopifyAdminConfigured()) {
    const catalog = getDummyVariantCatalog();
    const subtotal = catalog
      .slice(0, 2)
      .reduce((total, item) => total + item.priceCents, 0);
    return [
      {
        id: 'mock-order-1',
        name: '#FL1001',
        email: 'hello@featherlite.test',
        currency: 'USD',
        subtotal_price: (subtotal / 100).toFixed(2),
        total_price: (subtotal / 100 + 4.5).toFixed(2),
        financial_status: 'paid',
        fulfillment_status: 'fulfilled',
        processed_at: new Date().toISOString(),
        line_items: catalog.slice(0, 2).map((item, index) => ({
          id: `mock-order-line-${index + 1}`,
          name: item.title,
          sku: item.sku,
          quantity: 1,
          price: (item.priceCents / 100).toFixed(2),
          variant_id: item.merchandiseId,
        })),
      },
    ];
  }
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

