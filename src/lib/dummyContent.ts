export type DummyVariant = {
  id: string;
  name: string;
  sku: string;
  priceCents: number;
  hex?: string;
  shopifyVariantId: string;
};

export type DummyImage = {
  id: string;
  url: string;
  alt?: string;
};

export type DummyProduct = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  description: string;
  ingredients: string;
  imagePath?: string;
  thumbnailPath?: string;
  collection?: { season?: string } | null;
  variants: DummyVariant[];
  images?: DummyImage[];
  highlights?: string[];
};

export type DummyReview = {
  id: string;
  productSlug: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const DUMMY_PRODUCTS: DummyProduct[] = [
  {
    id: 'prod-weightless-foundation',
    slug: 'weightless-mineral-foundation',
    name: 'Weightless Mineral Foundation',
    kind: 'foundation',
    description:
      'An airy mineral foundation that blurs imperfections and nourishes skin with a satin, second-skin finish.',
    ingredients:
      'Mica, Zinc Oxide, Rice Powder, Squalane, Aloe Leaf Extract, Vitamin E.',
    collection: { season: 'Year-Round' },
    imagePath: '/images/placeholders/product-placeholder.svg',
    variants: [
      {
        id: 'var-foundation-porcelain',
        name: 'Porcelain',
        sku: 'FL-FOUND-01',
        priceCents: 3200,
        hex: '#F7E6DB',
        shopifyVariantId: 'gid://shopify/ProductVariant/foundation-porcelain',
      },
      {
        id: 'var-foundation-vanilla',
        name: 'Vanilla',
        sku: 'FL-FOUND-02',
        priceCents: 3200,
        hex: '#F0D5C2',
        shopifyVariantId: 'gid://shopify/ProductVariant/foundation-vanilla',
      },
      {
        id: 'var-foundation-sand',
        name: 'Sand',
        sku: 'FL-FOUND-03',
        priceCents: 3200,
        hex: '#D9B093',
        shopifyVariantId: 'gid://shopify/ProductVariant/foundation-sand',
      },
      {
        id: 'var-foundation-mocha',
        name: 'Mocha',
        sku: 'FL-FOUND-04',
        priceCents: 3200,
        hex: '#8C5B45',
        shopifyVariantId: 'gid://shopify/ProductVariant/foundation-mocha',
      },
    ],
    highlights: [
      '24-hour breathable wear',
      'Infused with calming botanicals',
      'Buildable sheer-to-medium coverage',
    ],
  },
  {
    id: 'prod-silk-veil-powder',
    slug: 'silk-veil-setting-powder',
    name: 'Silk Veil Setting Powder',
    kind: 'set',
    description:
      'A translucent finishing powder that softens texture and locks in makeup without muting your glow.',
    ingredients: 'Kaolin Clay, Rice Bran, Hyaluronic Acid, Chamomile Flower Powder.',
    collection: { season: 'Spring' },
    imagePath: '/images/placeholders/product-placeholder.svg',
    variants: [
      {
        id: 'var-powder-translucent',
        name: 'Translucent',
        sku: 'FL-POW-01',
        priceCents: 2600,
        shopifyVariantId: 'gid://shopify/ProductVariant/powder-translucent',
      },
      {
        id: 'var-powder-rose',
        name: 'Soft Rose',
        sku: 'FL-POW-02',
        priceCents: 2600,
        shopifyVariantId: 'gid://shopify/ProductVariant/powder-rose',
      },
    ],
    highlights: [
      'Blurs texture with photo-soft focus',
      'Controls shine without drying skin',
      'Infused with hyaluronic acid for comfort',
    ],
  },
  {
    id: 'prod-luminous-blush',
    slug: 'luminous-mineral-blush',
    name: 'Luminous Mineral Blush Duo',
    kind: 'blush',
    description:
      'Silky mineral blushes baked with plant oils for a lit-from-within flush that melts into skin.',
    ingredients: 'Mica, Rosehip Oil, Shea Butter, Hibiscus Extract, Vitamin C.',
    collection: { season: 'Summer' },
    imagePath: '/images/placeholders/product-placeholder.svg',
    variants: [
      {
        id: 'var-blush-dawn',
        name: 'Soft Dawn',
        sku: 'FL-BLUSH-01',
        priceCents: 2800,
        hex: '#F5A0A9',
        shopifyVariantId: 'gid://shopify/ProductVariant/blush-dawn',
      },
      {
        id: 'var-blush-horizon',
        name: 'Golden Horizon',
        sku: 'FL-BLUSH-02',
        priceCents: 2800,
        hex: '#EB7965',
        shopifyVariantId: 'gid://shopify/ProductVariant/blush-horizon',
      },
    ],
    highlights: [
      'Baked minerals for a seamless blend',
      'Dual shades for custom colour',
      'Antioxidant-rich botanicals protect skin',
    ],
  },
  {
    id: 'prod-horizon-eye',
    slug: 'horizon-eye-quartet',
    name: 'Horizon Eye Quartet',
    kind: 'eyeshadow',
    description:
      'Four weightless mineral shadows inspired by sunrise light, with buttery mattes and prismatic shimmers.',
    ingredients: 'Mica, Jojoba Oil, Sunflower Seed Wax, Calendula Extract.',
    collection: { season: 'Fall' },
    imagePath: '/images/placeholders/product-placeholder.svg',
    variants: [
      {
        id: 'var-eye-quartet',
        name: 'Sunrise Horizon',
        sku: 'FL-EYE-01',
        priceCents: 4200,
        shopifyVariantId: 'gid://shopify/ProductVariant/eye-horizon',
      },
    ],
    highlights: [
      'Feather-light mineral pigments',
      'Crease-resistant wear for 12 hours',
      'Shimmers infused with light-reflecting pearls',
    ],
  },
];

const DUMMY_REVIEWS: DummyReview[] = [
  {
    id: 'rev-1',
    productSlug: 'weightless-mineral-foundation',
    name: 'Amelia R.',
    rating: 5,
    comment:
      'My skin still feels like skin—just smoother. The coverage is buildable and never cakey.',
    createdAt: new Date('2024-04-12').toISOString(),
  },
  {
    id: 'rev-2',
    productSlug: 'weightless-mineral-foundation',
    name: 'Priya S.',
    rating: 4,
    comment: 'A beautiful base that wears all day. I love the calming ingredients inside.',
    createdAt: new Date('2024-05-01').toISOString(),
  },
  {
    id: 'rev-3',
    productSlug: 'silk-veil-setting-powder',
    name: 'Jordan P.',
    rating: 5,
    comment: 'Locks makeup in place without flattening my glow. A forever staple.',
    createdAt: new Date('2024-03-22').toISOString(),
  },
  {
    id: 'rev-4',
    productSlug: 'luminous-mineral-blush',
    name: 'Stella M.',
    rating: 5,
    comment: 'The duo compact makes it easy to switch from day to night. Melts into my skin!',
    createdAt: new Date('2024-02-08').toISOString(),
  },
  {
    id: 'rev-5',
    productSlug: 'horizon-eye-quartet',
    name: 'Tessa W.',
    rating: 4,
    comment: 'Feather-light pigment with zero fallout. The shimmers are stunning.',
    createdAt: new Date('2024-01-18').toISOString(),
  },
];

const VARIANT_BY_SHOPIFY_ID = new Map(
  DUMMY_PRODUCTS.flatMap((product) =>
    product.variants.map((variant) => [variant.shopifyVariantId, { product, variant } as const])
  )
);

const VARIANT_BY_SKU = new Map(
  DUMMY_PRODUCTS.flatMap((product) => product.variants.map((variant) => [variant.sku, { product, variant } as const]))
);

export function getDummyProducts(): DummyProduct[] {
  return DUMMY_PRODUCTS;
}

export function getDummyProduct(slug: string): DummyProduct | undefined {
  return DUMMY_PRODUCTS.find((product) => product.slug === slug);
}

export function getDummyReviews(productSlug: string): DummyReview[] {
  return DUMMY_REVIEWS.filter((review) => review.productSlug === productSlug);
}

export function getDummyVariantByShopifyId(shopifyVariantId: string | null | undefined) {
  if (!shopifyVariantId) return undefined;
  return VARIANT_BY_SHOPIFY_ID.get(shopifyVariantId);
}

export function getDummyVariantBySku(sku: string | null | undefined) {
  if (!sku) return undefined;
  return VARIANT_BY_SKU.get(sku);
}

export function getDummyVariantCatalog() {
  return Array.from(VARIANT_BY_SHOPIFY_ID.values()).map(({ product, variant }) => ({
    merchandiseId: variant.shopifyVariantId,
    sku: variant.sku,
    title: `${product.name}${variant.name !== 'Default' ? ` – ${variant.name}` : ''}`,
    priceCents: variant.priceCents,
    currencyCode: 'USD',
  }));
}
