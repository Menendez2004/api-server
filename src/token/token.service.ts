import { Injectable, InternalServerErrorException, NotFoundException, UseFilters } from '@nestjs/common';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { VerificationTokens, Prisma } from '@prisma/client';
import { GlobalExceptionFilter } from '../helpers/filters/global.exception.filter';

@Injectable()
@UseFilters(new GlobalExceptionFilter())
export class TokenService {
    constructor(private readonly prismaService: PrismaService) { }


    async createToken(
        token: Prisma.VerificationTokensCreateInput
    ): Promise<VerificationTokens> {
        try {
            return await this.prismaService.verificationTokens.create({ data: token });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                throw new InternalServerErrorException(`Prisma error code: ${error.code}, Message: ${error.message}`);
            }
            throw new InternalServerErrorException('Failed to create token', error.message);
        }
    }
    
    async findAuthToken(token: string): Promise<VerificationTokens> {
        const authToken = await this.prismaService.verificationTokens.findFirst({ where: { token } });
        if (!authToken) {
            throw new NotFoundException(`Token not found: ${token}`);
        }
        return authToken;
    }


    async encodeToken(data: string): Promise<string> {
        return TokenService.encodeBase64(data);
    }


    async decodeToken(data: string): Promise<string> {
        return TokenService.decodeBase64(data);
    }


//******************************************************************/
    private static encodeBase64(data: string): string {
        return Buffer.from(data).toString('base64');
    }

    private static decodeBase64(data: string): string {
        return Buffer.from(data, 'base64').toString('utf-8');
    }
}
