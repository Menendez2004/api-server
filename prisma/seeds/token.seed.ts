import { PrismaClient, TokenTypes, TokenType } from '@prisma/client';

export default async (
    prisma: PrismaClient,
): Promise<TokenTypes[]> => {
    return Promise.all([
        prisma.tokenTypes.upsert({
            where: {id: 1},
            create: {
                id: 1,
                tokenName: TokenType.resetPassword
            },
            update: {},
        }),
        prisma.tokenTypes.upsert({
            where: {id: 2},
            create: {
                id: 2,
                tokenName: TokenType.resetPassword,
            },
            update: {},
        })
    ]);
};