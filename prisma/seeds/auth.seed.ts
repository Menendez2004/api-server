import { PrismaClient, User } from '@prisma/client';
import * as argon2 from 'argon2';

export default async (prisma: PrismaClient): Promise<User> => {
    const email = process.env.MANAGER_EMAIL;
    const password = await argon2.hash(process.env.MANAGER_PASSWORD || '', {
        type: argon2.argon2id,
    });

    return prisma.user.upsert({
        where: { email },
        create: {
            firstName: 'manager',
            lastName: 'admin',
            username: 'MANAGER',
            email,
            isActive: true,
            roleId: 1,
            addresses: 'Only addmins have access to this street 2004',
            password,
        },
        update: {},
    });
};
