import { PrismaClient } from '@prisma/client';

const categories = [
    { name: "Men's Shoes" },
    { name: "Women's Shoes" },
    { name: "Sports Shoes" },
    { name: "Casual Shoes" },
    { name: "Boots" },
    { name: "Sandals" },
    { name: "Slippers" },
    { name: "High Heels" },
    { name: "Running Shoes" },
    { name: "Work Shoes" },
    { name: "Flip-Flops" },
    { name: "Sneakers" },
    { name: "Loafers" },
    { name: "Moccasins" },
    { name: "Wedges" },
    { name: "Clogs" },
    { name: "Dress Shoes" },
    { name: "Athletic Shoes" },
    { name: "Outdoor Footwear" },
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
