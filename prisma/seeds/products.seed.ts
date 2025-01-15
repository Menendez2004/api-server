import { PrismaClient } from '@prisma/client';

const products = [
    {
        name: "Air Zoom Pegasus 39",
        description: "A versatile running shoe for everyday wear and training.",
        stock: 50,
        price: 120.0,
        categoryName: "Sports Shoes",
    },
    {
        name: "Classic Leather Sneakers",
        description: "Timeless casual shoes that pair with everything.",
        stock: 100,
        price: 75.0,
        categoryName: "Casual Shoes",
    },
    {
        name: "Men's Derby Shoes",
        description: "Elegant leather shoes for formal occasions.",
        stock: 30,
        price: 150.0,
        categoryName: "Men's Shoes",
    },
    {
        name: "Women's Ballet Flats",
        description: "Stylish and comfortable flats for all-day wear.",
        stock: 80,
        price: 50.0,
        categoryName: "Women's Shoes",
    },
    {
        name: "Trail Running Shoes",
        description: "Durable shoes designed for rugged outdoor terrain.",
        stock: 40,
        price: 130.0,
        categoryName: "Sports Shoes",
    },
    {
        name: "Canvas Slip-Ons",
        description: "Lightweight casual shoes with a slip-on design.",
        stock: 60,
        price: 40.0,
        categoryName: "Casual Shoes",
    },
];

export default async function productsSeed(prisma: PrismaClient) {
    console.log('Seeding shoe products...');

    const categories = await prisma.categories.findMany();
    const categoryMap = categories.reduce((map, category) => {
        map[category.name] = category.id;
        return map;
    }, {} as Record<string, number>);

    for (const product of products) {
        const categoryId = categoryMap[product.categoryName];
        if (!categoryId) {
            console.error(`Category not found for product: ${product.name}`);
            continue;
        }
        await prisma.products.create({
            data: {
                name: product.name,
                description: product.description,
                stock: product.stock,
                price: product.price,
                Categories: {
                    create: {
                        categoryId,
                    },
                },
            },
        });
    }

    if(products.length < 0) {
        console.error('No products seeded');
    }else {
        console.log('Shoe products seeded successfully!');
    }
}
