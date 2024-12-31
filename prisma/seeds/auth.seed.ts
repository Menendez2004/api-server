import * as bcrypt from 'bcrypt';
import { PrismaClient, User } from '@prisma/client';

export default async (prisma: PrismaClient): Promise<User> => {
    const email = process.env.MANAGER_EMAIL;
    if (!email) {
        throw new Error('MANAGER_EMAIL environment variable is not set');
    }
    const password = await bcrypt.hash(process.env.MANAGER_PASSWORD || '', 10); // 10 rounds of salt

    return prisma.user.upsert({
        where: { email },
        create: {
            firstName: 'manager',
            lastName: 'admin',
            username: 'MANAGER',
            email,
            isActive: true,
            roleId: 1,
            addresses: 'Only admins have access to this street 2004',
            password,
        },
        update: {},
    });
};