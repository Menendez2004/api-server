import { PrismaClient } from '@prisma/client';
import UsersRoleSeed from './users.role.seed';
import tokenSeed from './token.seed';
import authSeed from './auth.seed';
import categoriesSeed from './categories.seed';
import productsSeed from './products.seed';

const prisma = new PrismaClient();

async function main() {
    await UsersRoleSeed(prisma);
    await tokenSeed(prisma);
    await authSeed(prisma);
    await categoriesSeed(prisma);
    await productsSeed(prisma);
}

main()
    .catch((e) => {
        console.error('Error during seeding 🌱:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect()
    });
