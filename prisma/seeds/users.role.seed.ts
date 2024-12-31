import { PrismaClient, RoleName, UserRole } from '@prisma/client';
import { config } from 'dotenv';
config(); // Carga las variables del archivo .env


export default async (prisma: PrismaClient): Promise<UserRole[]> => {
    try {
        console.log('Database URL:', process.env.DATABASE_URL);
        const roles = await Promise.all([
            prisma.userRole.upsert({
                where: { id: 1 },
                create: {
                    id: 1,
                    uuid: '3183e67f-08d2-466c-8bed-237442d5038b',
                    name: RoleName.MANAGER,
                },
                update: {},
            }),
            prisma.userRole.upsert({
                where: { id: 2 },
                create: {
                    id: 2,
                    uuid: '6a82fa94-cda6-45bf-beae-a10fac8bda9b',
                    name: RoleName.CLIENT,

                },
                update: {},
            }),
        ]);

        console.log('User roles seeded successfully:', roles);
        return roles;
    } catch (err) {
        console.error('Error seeding user roles:', err);
        throw err;
    }
};