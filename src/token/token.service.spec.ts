import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { VerificationTokens } from '@prisma/client';
import { InternalServerErrorException } from '@nestjs/common';

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
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    tokenService = module.get<TokenService>(TokenService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createToken', () => {
    it('should cretae a verification token succesfully ', async () => {
      const data = {
        token: 'testing-token-service',
        consumed: false,
        expiredAt: new Date(),
        user: { connect: { id: 'testing-user-token' } },
        tokenType: { connect: { id: 1 } },
      };
      const initialToken: VerificationTokens = {
        id: 'testing-token-service',
        token: data.token,
        consumed: data.consumed,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiredAt: data.expiredAt,
        userId: 'testing-user-token',
        tokenTypeId: 1,
      };

      const createSpy = jest
        .spyOn(prismaService.verificationTokens, 'create')
        .mockResolvedValue(initialToken);

      const response = await tokenService.createToken(data);
      expect(response).toEqual(initialToken);
      expect(createSpy).toHaveBeenCalledWith({
        data,
      });
      expect(createSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('should throw an error when creating a verification token', async () => {
    const data = {
      token: 'testing-token-service',
      consumed: false,
      expiredAt: new Date(),
      user: { connect: { id: 'testing-user-token' } },
      tokenType: { connect: { id: 1 } },
    };

    jest
      .spyOn(prismaService.verificationTokens, 'create')
      .mockRejectedValue(new Error('testing-error'));

    await expect(tokenService.createToken(data)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  describe('findAuthToken', () => {
    it('should find a verification token successfully', async () => {
      const token = 'testing-token-service';
      const encodeToken = Buffer.from(token).toString('base64');
      const response = await tokenService.decodeToken(encodeToken);
      expect(response).toEqual(token);
    });
  });

  describe('encodeToken', () => {
    it('should encode a verification token successfully', async () => {
      const token = 'testing-token-service';
      const encodeToken = Buffer.from(token).toString('base64');
      const response = await tokenService.encodeToken(token);
      expect(response).toEqual(encodeToken);
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
