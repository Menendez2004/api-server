import { PrismaClient, VerificationType, TokenType } from '@prisma/client';

export default async (
    prisma: PrismaClient,
): Promise<VerificationType[]> => {
    return Promise.all([
        prisma.verificationType.upsert({
            where: {id: 1},
            create: {
                id: 1,
                tokenType: TokenType.VERIFICATION_EMAIL,
            },
            update: {},
        }),
        prisma.verificationType.upsert({
            where: {id: 2},
            create: {
                id: 1,
                tokenType: TokenType.RESET_PASS,
            },
            update: {},
        })
    ]);
};