
import { PrismaClient, RoleName, UserRole } from '@prisma/client';

export default async (prisma: PrismaClient): Promise<UserRole[]> => {
    return Promise.all([
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
};


