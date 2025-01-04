import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
    const shoes = [
        {
            name: 'Running Shoes',
            description: 'Lightweight and breathable running shoes for optimal performance.',
            stock: 50,
            price: 120.00,
        },
        {
            name: 'Basketball Shoes',
            description: 'High-top basketball shoes with ankle support and cushioning.',
            stock: 30,
            price: 150.00,
        },
        {
            name: 'Hiking Boots',
            description: 'Durable and waterproof hiking boots for rugged terrain.',
            stock: 20,
            price: 180.00,
        },
        {
            name: 'Casual Sneakers',
            description: 'Comfortable and stylish sneakers for everyday wear.',
            stock: 40,
            price: 80.00,
        },
        {
            name: 'Dress Shoes',
            description: 'Classic leather dress shoes for formal occasions.',
            stock: 25,
            price: 100.00,
        },
        {
            name: 'Sandals',
            description: 'Open-toe sandals for warm weather and casual outings.',
            stock: 60,
            price: 50.00,
        },
        {
            name: 'Work Boots',
            description: 'Sturdy and protective work boots for demanding jobs.',
            stock: 15,
            price: 160.00,
        },
        {
            name: 'Tennis Shoes',
            description: 'Supportive tennis shoes for quick movements and lateral stability.',
            stock: 35,
            price: 90.00,
        },
        {
            name: 'Training Shoes',
            description: 'Versatile training shoes for gym workouts and cross-training.',
            stock: 45,
            price: 110.00,
        },
        {
            name: 'Slip-on Shoes',
            description: 'Easy-to-wear slip-on shoes for casual comfort.',
            stock: 55,
            price: 70.00,
        },
    ];

    try {
        for (const shoe of shoes) {
            await prisma.products.create({
                data: shoe,
            });
        }
        console.log('Shoes seeded successfully!');
    } catch (error) {
        console.error('Error seeding shoes:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();