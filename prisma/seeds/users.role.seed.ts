import { PrismaClient, UserRoles, RoleName } from '@prisma/client';



export default async (prisma: PrismaClient): Promise<UserRoles[]> => {
    try {
        const roles = await Promise.all([
            prisma.userRoles.upsert({
                where: { id: 1 },
                create: {
                    id: 1,
                    name: RoleName.MANAGER,
                },
                update: {},
            }),
            prisma.userRoles.upsert({
                where: { id: 2 },
                create: {
                    id: 2,
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