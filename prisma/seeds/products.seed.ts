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
    {
        name: "Boots",
        description: "Sturdy and stylish footwear for various occasions.",
        stock: 50,
        price: 90.0,
        categoryName: "Boots"
    },
    {
        name: "Sandals",
        description: "Open-toed footwear perfect for warm weather.",
        stock: 70,
        price: 30.0,
        categoryName: "Sandals"
    },
    {
        name: "Slippers",
        description: "Comfortable and cozy indoor footwear.",
        stock: 100,
        price: 20.0,
        categoryName: "Slippers"
    },
    {
        name: "High Heels",
        description: "Elegant and stylish heels for formal events.",
        stock: 40,
        price: 80.0,
        categoryName: "High Heels"
    },
    {
        name: "Running Shoes",
        description: "Specialized shoes designed for high-performance running.",
        stock: 60,
        price: 110.0,
        categoryName: "Running Shoes"
    },
    {
        name: "Work Shoes",
        description: "Durable shoes built for long hours on your feet.",
        stock: 30,
        price: 75.0,
        categoryName: "Work Shoes"
    },
    {
        name: "Flip-Flops",
        description: "Casual and breezy footwear for relaxed days.",
        stock: 120,
        price: 15.0,
        categoryName: "Flip-Flops"
    },
    {
        name: "Sneakers",
        description: "Casual and comfortable shoes for everyday wear.",
        stock: 80,
        price: 60.0,
        categoryName: "Sneakers"
    },
    {
        name: "Loafers",
        description: "Slip-on shoes offering a sleek and polished look.",
        stock: 50,
        price: 65.0,
        categoryName: "Loafers"
    },
    {
        name: "Moccasins",
        description: "Soft and flexible shoes with a traditional look.",
        stock: 40,
        price: 55.0,
        categoryName: "Moccasins"
    },
    {
        name: "Wedges",
        description: "Stylish footwear offering a mix of comfort and height.",
        stock: 30,
        price: 85.0,
        categoryName: "Wedges"
    },
    {
        name: "Clogs",
        description: "Comfortable, slip-on shoes for various occasions.",
        stock: 60,
        price: 40.0,
        categoryName: "Clogs"
    },
    {
        name: "Dress Shoes",
        description: "Formal shoes for sophisticated looks.",
        stock: 40,
        price: 120.0,
        categoryName: "Dress Shoes"
    },
    {
        name: "Athletic Shoes",
        description: "Shoes designed for sports and physical activities.",
        stock: 70,
        price: 90.0,
        categoryName: "Athletic Shoes"
    },
    {
        name: "Outdoor Footwear",
        description: "Rugged shoes built for hiking, trekking, and outdoor adventures.",
        stock: 50,
        price: 100.0,
        categoryName: "Outdoor Footwear"
    }
    
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
