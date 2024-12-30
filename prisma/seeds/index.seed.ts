import { PrismaClient } from '@prisma/client';
import UsersRoleSeed from './usersRoleSeed';
import tokenSeed from './token.seed';
import authSeed from './auth.seed';

const prisma = new PrismaClient();

async function main() {
    await UsersRoleSeed(prisma); 
    await tokenSeed(prisma);
    await authSeed(prisma);

}

main()
    .then(() => console.log(' fulfilled'))
    .catch((e) => {
        console.error(e);
        process.exit(1);
}).finally(async () => await prisma.$disconnect());