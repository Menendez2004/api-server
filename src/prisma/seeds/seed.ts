import { PrismaClient } from '@prisma/client';
import UsersRoleSeed from './usersRoleSeed';

const prisma = new PrismaClient();

async function main() {
    await UsersRoleSeed(prisma);

}

main()
    .then(() => console.log('🌱 seeds was successfully!'))
    .catch((e) => {
        console.error(e);
        process.exit(1);
}).finally(async () => await prisma.$disconnect());