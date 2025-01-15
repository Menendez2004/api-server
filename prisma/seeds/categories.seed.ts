import { PrismaClient } from '@prisma/client';

const categories = [
    { name: "Men's Shoes" },
    { name: "Women's Shoes" },
    { name: "Sports Shoes" },
    { name: "Casual Shoes" },
];

export default async function categoriesSeed(prisma: PrismaClient) {
    console.log('Seeding shoe categories...');
    for (const category of categories) {
        await prisma.categories.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }
    console.log('Shoe categories seeded successfully!', categories);
}
