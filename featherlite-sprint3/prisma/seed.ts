import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script for the FeatherLite Sprint 3 database. This script creates
 * a minimal dataset including a collection, a product with variants that
 * define shade hex values, and a handful of customer reviews. In a
 * production environment you'd replace this with your actual product
 * catalogue and import data from external sources.
 */
async function main() {
  // Create or update a collection for year-round products
  const collection = await prisma.collection.upsert({
    where: { slug: 'year-round' },
    update: {},
    create: {
      slug: 'year-round',
      name: 'Year-Round Collection',
      season: 'Year-Round',
    },
  });

  // Create or update a sample product with three shade variants. Each
  // variant includes a hex value that will be rendered as a swatch on
  // the product card and product detail page. Adjust the priceCents
  // values and shade colours to suit your data.
  const product = await prisma.product.upsert({
    where: { slug: 'sample-foundation' },
    update: {},
    create: {
      slug: 'sample-foundation',
      name: 'Sample Foundation',
      kind: 'foundation',
      description: 'A lightweight mineral foundation for everyday wear.',
      ingredients:
        'Sericite (mica), Kaolin, Magnesium Carbonate, Zinc Stearate, Zinc Oxide, Titanium Dioxide; some shades: micas & iron oxides',
      collectionId: collection.id,
      variants: {
        create: [
          {
            name: 'Porcelain',
            sku: 'SF-PORCELAIN',
            priceCents: 2200,
            stockQty: 50,
            hex: '#F4E5D5',
          },
          {
            name: 'Sand',
            sku: 'SF-SAND',
            priceCents: 2200,
            stockQty: 50,
            hex: '#E9D1B5',
          },
          {
            name: 'Mocha',
            sku: 'SF-MOCHA',
            priceCents: 2200,
            stockQty: 50,
            hex: '#C89A73',
          },
        ],
      },
    },
  });

  // Insert a few example reviews for the sample product
  await prisma.review.createMany({
    data: [
      {
        productId: product.id,
        name: 'Alice',
        rating: 5,
        comment: 'The best foundation I have ever used! It feels weightless and looks so natural.',
      },
      {
        productId: product.id,
        name: 'Bella',
        rating: 4,
        comment: 'Great coverage and stays on all day. A bit pricey but worth it.',
      },
      {
        productId: product.id,
        name: 'Chris',
        rating: 3,
        comment: 'Good texture but the shade range could be expanded.',
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });