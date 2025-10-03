"use strict";
// Generated from prisma/seed.ts using "npm run build:seed". Do not edit directly.
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const isProductionLike = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const allowSeeding = process.env.ALLOW_PRISMA_SEED === 'true';
/**
 * Seeds the database with a lightweight demo catalogue that is safe to show to clients.
 * The script is idempotent, making use of upserts and skipping duplicate review inserts
 * so that it can be executed multiple times during development without creating duplicates.
 */
async function main() {
    if (isProductionLike && !allowSeeding) {
        console.warn('Skipping Prisma seed because the environment appears to be production. Set ALLOW_PRISMA_SEED="true" to override this check.');
        return;
    }
    console.info('🌱 Seeding FeatherLite demo data...');
    await prisma.$transaction(async (tx) => {
        const collection = await tx.collection.upsert({
            where: { slug: 'year-round' },
            update: {
                name: 'Year-Round Collection',
                season: 'Year-Round',
            },
            create: {
                slug: 'year-round',
                name: 'Year-Round Collection',
                season: 'Year-Round',
            },
        });
        const product = await tx.product.upsert({
            where: { slug: 'featherlite-foundation' },
            update: {
                name: 'FeatherLite Mineral Foundation',
                kind: 'foundation',
                description: 'A breathable mineral foundation created to flex with your skin. Perfect for in-person demos and lightweight enough for everyday use.',
                ingredients: 'Sericite (mica), Kaolin, Magnesium Carbonate, Zinc Stearate, Zinc Oxide, Titanium Dioxide; select shades include ethically sourced micas and iron oxides.',
                collectionId: collection.id,
            },
            create: {
                slug: 'featherlite-foundation',
                name: 'FeatherLite Mineral Foundation',
                kind: 'foundation',
                description: 'A breathable mineral foundation created to flex with your skin. Perfect for in-person demos and lightweight enough for everyday use.',
                ingredients: 'Sericite (mica), Kaolin, Magnesium Carbonate, Zinc Stearate, Zinc Oxide, Titanium Dioxide; select shades include ethically sourced micas and iron oxides.',
                collectionId: collection.id,
                variants: {
                    create: [
                        {
                            name: 'Porcelain',
                            sku: 'FL-FOUNDATION-PORCELAIN',
                            priceCents: 2600,
                            stockQty: 40,
                            hex: '#F4E5D5',
                        },
                        {
                            name: 'Sand',
                            sku: 'FL-FOUNDATION-SAND',
                            priceCents: 2600,
                            stockQty: 40,
                            hex: '#E9D1B5',
                        },
                        {
                            name: 'Mocha',
                            sku: 'FL-FOUNDATION-MOCHA',
                            priceCents: 2600,
                            stockQty: 40,
                            hex: '#C89A73',
                        },
                    ],
                },
            },
            include: { variants: true },
        });
        await tx.variant.deleteMany({
            where: { productId: product.id, hex: null },
        });
        await tx.review.createMany({
            data: [
                {
                    productId: product.id,
                    name: 'Alice',
                    rating: 5,
                    comment: 'The finish is luminous without feeling heavy. Perfect for client demos when we need a reliable base.',
                    status: 'APPROVED',
                },
                {
                    productId: product.id,
                    name: 'Bella',
                    rating: 4,
                    comment: 'Glides on smoothly and looks great on camera. The Sand shade is a studio favourite.',
                    status: 'APPROVED',
                },
                {
                    productId: product.id,
                    name: 'Chris',
                    rating: 4,
                    comment: 'Love the undertones, but I would like to see a few deeper shades for future campaigns.',
                    status: 'APPROVED',
                },
            ],
            skipDuplicates: true,
        });
    });
    console.info('✅ Demo data seeded successfully.');
}
main()
    .catch((error) => {
    console.error('❌ Prisma seed failed:', error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
