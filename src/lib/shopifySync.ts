import prisma from '@/lib/prisma';

function toCents(value: unknown): number {
  if (typeof value === 'number') {
    return Math.round(value * 100);
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return Math.round(parsed * 100);
    }
  }
  return 0;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function ensureSlug(handle?: string | null, title?: string | null, id?: string | number | null) {
  if (handle && handle.trim().length > 0) {
    return handle.trim();
  }
  if (title && title.trim().length > 0) {
    return slugify(title.trim());
  }
  if (id) {
    return `shopify-product-${id}`;
  }
  return `shopify-product-${Date.now()}`;
}

function transformVariantSku(variant: any) {
  const sku = variant?.sku;
  if (sku && sku.trim().length > 0) {
    return sku.trim();
  }
  const id = variant?.id ? String(variant.id) : undefined;
  return id ? `shopify-variant-${id}` : `shopify-variant-${Date.now()}`;
}

export async function upsertShopifyProduct(product: any) {
  const shopifyProductId = product?.id ? String(product.id) : undefined;
  const slug = ensureSlug(product?.handle, product?.title, shopifyProductId);
  const baseData = {
    name: product?.title ?? slug,
    description: product?.body_html ?? null,
    kind: product?.product_type ?? 'product',
    ingredients: null as string | null,
    live: product?.status !== 'draft',
    shopifyProductId,
  };

  const dbProduct = await prisma.product.upsert({
    where: { slug },
    update: baseData,
    create: {
      slug,
      ...baseData,
    },
  });

  const variants: any[] = Array.isArray(product?.variants) ? product.variants : [];
  const variantSkus = new Set<string>();

  for (const variant of variants) {
    const sku = transformVariantSku(variant);
    const priceCents = toCents(variant?.price);
    const stockQty = typeof variant?.inventory_quantity === 'number' ? variant.inventory_quantity : 0;
    const shopifyVariantId = variant?.id ? String(variant.id) : null;
    variantSkus.add(sku);

    await prisma.variant.upsert({
      where: { sku },
      update: {
        name: variant?.title ?? 'Default',
        priceCents,
        stockQty,
        shopifyVariantId,
        productId: dbProduct.id,
      },
      create: {
        name: variant?.title ?? 'Default',
        sku,
        priceCents,
        stockQty,
        shopifyVariantId,
        productId: dbProduct.id,
      },
    });
  }

  if (variantSkus.size > 0) {
    await prisma.variant.deleteMany({
      where: {
        productId: dbProduct.id,
        sku: { notIn: Array.from(variantSkus) },
      },
    });
  }

  return dbProduct;
}

function transformLineItems(lineItems: any[]) {
  return (Array.isArray(lineItems) ? lineItems : []).map((item) => ({
    title: item?.name ?? 'Item',
    sku: item?.sku ? String(item.sku) : null,
    quantity: Number(item?.quantity) || 0,
    priceCents: toCents(item?.price),
    shopifyLineItemId: item?.id ? String(item.id) : null,
    merchandiseId: item?.variant_id ? String(item.variant_id) : null,
  }));
}

export async function upsertShopifyOrder(order: any) {
  const shopifyOrderId = order?.id ? String(order.id) : undefined;
  if (!shopifyOrderId) {
    throw new Error('Order is missing an ID');
  }

  const baseData = {
    shopifyOrderId,
    name: order?.name ?? null,
    email: order?.email ?? null,
    currency: order?.currency ?? 'USD',
    subtotalCents: toCents(order?.subtotal_price ?? order?.total_price),
    totalCents: toCents(order?.total_price),
    financialStatus: order?.financial_status ?? 'pending',
    fulfillmentStatus: order?.fulfillment_status ?? null,
    processedAt: order?.processed_at ? new Date(order.processed_at) : null,
  };

  const lineItems = transformLineItems(order?.line_items ?? []);

  const existing = await prisma.order.findUnique({ where: { shopifyOrderId } });
  if (existing) {
    await prisma.order.update({
      where: { id: existing.id },
      data: baseData,
    });
    await prisma.orderItem.deleteMany({ where: { orderId: existing.id } });
    if (lineItems.length > 0) {
      await prisma.orderItem.createMany({
        data: lineItems.map((item) => ({ ...item, orderId: existing.id })),
        skipDuplicates: true,
      });
    }
    return prisma.order.findUnique({
      where: { id: existing.id },
      include: { items: true },
    });
  }

  return prisma.order.create({
    data: {
      ...baseData,
      items: {
        create: lineItems,
      },
    },
    include: { items: true },
  });
}

export async function syncProducts(products: any[]) {
  let count = 0;
  for (const product of products) {
    await upsertShopifyProduct(product);
    count += 1;
  }
  return count;
}

export async function syncOrders(orders: any[]) {
  let count = 0;
  for (const order of orders) {
    await upsertShopifyOrder(order);
    count += 1;
  }
  return count;
}

