import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { VerificationTokens, Prisma } from '@prisma/client';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('TokenService', () => {
  let tokenService: TokenService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: PrismaService,
          useValue: {
            verificationTokens: {
              create: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    tokenService = module.get<TokenService>(TokenService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createToken', () => {
    const mockTokenData = {
      token: 'testing-token-service',
      consumed: false,
      expiredAt: new Date(),
      user: { connect: { id: 'testing-user-token' } },
      tokenType: { connect: { id: 1 } },
    };

    const mockToken: VerificationTokens = {
      id: 'testing-token-service',
      token: mockTokenData.token,
      consumed: mockTokenData.consumed,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiredAt: mockTokenData.expiredAt,
      userId: 'testing-user-token',
      tokenTypeId: 1,
    };

    it('should create a verification token successfully', async () => {
      const createSpy = jest
        .spyOn(prismaService.verificationTokens, 'create')
        .mockResolvedValue(mockToken);

      const response = await tokenService.createToken(mockTokenData);

      expect(response).toEqual(mockToken);
      expect(createSpy).toHaveBeenCalledWith({
        data: mockTokenData,
      });
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException when Prisma throws a known error', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Prisma error message',
        {
          code: 'P2002',
          clientVersion: '2.0.0',
        },
      );

      jest
        .spyOn(prismaService.verificationTokens, 'create')
        .mockRejectedValue(prismaError);

      await expect(tokenService.createToken(mockTokenData)).rejects.toThrow(
        new InternalServerErrorException(
          `Prisma error code: ${prismaError.code}, Message: ${prismaError.message}`,
        ),
      );
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      const error = new Error('testing-error');

      jest
        .spyOn(prismaService.verificationTokens, 'create')
        .mockRejectedValue(error);

      await expect(tokenService.createToken(mockTokenData)).rejects.toThrow(
        new InternalServerErrorException(
          'Failed to create token',
          error.message,
        ),
      );
    });
  });

  describe('findAuthToken', () => {
    const mockToken: VerificationTokens = {
      id: 'test-id',
      token: 'test-token',
      consumed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiredAt: new Date(),
      userId: 'test-user-id',
      tokenTypeId: 1,
    };

    it('should find a verification token successfully', async () => {
      jest
        .spyOn(prismaService.verificationTokens, 'findFirst')
        .mockResolvedValue(mockToken);

      const result = await tokenService.findAuthToken('test-token');

      expect(result).toEqual(mockToken);
      expect(prismaService.verificationTokens.findFirst).toHaveBeenCalledWith({
        where: { token: 'test-token' },
      });
    });

    it('should throw NotFoundException when token is not found', async () => {
      jest
        .spyOn(prismaService.verificationTokens, 'findFirst')
        .mockResolvedValue(null);

      await expect(
        tokenService.findAuthToken('non-existent-token'),
      ).rejects.toThrow(
        new NotFoundException('Token not found: non-existent-token'),
      );
    });
  });

  describe('encodeToken', () => {
    it('should encode a verification token successfully', async () => {
      const token = 'testing-token-service';
      const encodedToken = Buffer.from(token).toString('base64');
      const response = await tokenService.encodeToken(token);
      expect(response).toEqual(encodedToken);
    });
  });

  describe('decodeToken', () => {
    it('should decode a verification token successfully', async () => {
      const token = 'testing-token-service';
      const encodedToken = Buffer.from(token).toString('base64');
      const response = await tokenService.decodeToken(encodedToken);
      expect(response).toEqual(token);
    });
  });
});
