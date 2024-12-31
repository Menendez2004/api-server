import { PrismaClient, VerificationType, TokenType } from '@prisma/client';

export default async (
    prisma: PrismaClient,
): Promise<VerificationType[]> => {
    return Promise.all([
        prisma.verificationType.upsert({
            where: {id: 1},
            create: {
                id: 1,
                uuid: 'd37515b0-105c-4387-a50e-0660d707c894',
                tokenType: TokenType.VERIFICATION_EMAIL,
            },
            update: {},
        }),
        prisma.verificationType.upsert({
            where: {id: 2},
            create: {
                id: 2,
                uuid: 'a947b9be-f954-4d03-a3de-55d2c350f2e3',
                tokenType: TokenType.RESET_PASS,
            },
            update: {},
        })
    ]);
};