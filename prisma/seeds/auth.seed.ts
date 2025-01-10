import * as bcrypt from 'bcrypt';
import { PrismaClient, Users } from '@prisma/client';

export default async (prisma: PrismaClient): Promise<Users> => {
    const email = process.env.EMAIL_USER;
    if (!email) {
        throw new Error('MANAGER_EMAIL environment variable is not set');
    }
    const password = await bcrypt.hash(process.env.MANAGER_PASSWORD || '', 10); // 10 rounds of salt

    return prisma.users.upsert({
        where: { email },
        create: {
            firstName: 'MANAGER',
            lastName: 'ADMIN',
            userName: 'MANAGER',
            email,
            roleId: 1,
            address: 'Only admins have access to this street 2004 headache',
            password,
        },
        update: {},
    });
};