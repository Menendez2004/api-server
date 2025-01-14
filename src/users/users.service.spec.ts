import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { UsersService } from './users.service';
import { TokenService } from '../token/token.service';
import { AuthentificationMock } from '../../test/mocks/authentication.mocks';
import { MocksUserService } from '../../test/mocks/user.create.mocks';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
describe('UsersService', () => {
  let userService: UsersService;
  let prismaService: PrismaService;
  let tokenService: TokenService;
  let mockPrismaUsers;
  let mockPrismaUserRoles;
  let mockPrismaVerificationTokens;
  let mockTokenService;

  beforeEach(async () => {
    mockPrismaUsers = {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    };

    mockPrismaUserRoles = {
      findUnique: jest.fn(),
    };

    mockPrismaVerificationTokens = {
      update: jest.fn(),
    };

    mockTokenService = {
      findAuthToken: jest.fn(),
      encodeToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            users: mockPrismaUsers,
            userRoles: mockPrismaUserRoles,
            verificationTokens: mockPrismaVerificationTokens,
          },
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    tokenService = module.get<TokenService>(TokenService);
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userMock = {
        id: '0fe3dbd4-aee0-47db-ac4e-56e2e3382a15',
        email: 'johndoe@example.com',
      } as any;

      mockPrismaUsers.create.mockResolvedValue(userMock);

      const result = await userService.createUser(MocksUserService.userCreate);

      expect(prismaService.users.create).toHaveBeenCalledWith({
        data: MocksUserService.userCreate,
      });
      expect(result).toEqual(userMock);
    });
    it('should throw an error if email is already in use (Prisma error)', async () => {
      const existingUserEmail = 'existinguser@example.com';
      mockPrismaUsers.findUnique.mockResolvedValue({ email: existingUserEmail });

      await expect(userService.createUser({
        email: existingUserEmail,
        firstName: '',
        lastName: '',
        userName: '',
        address: '',
        password: ''
      }))
        .rejects.toThrow (new BadRequestException('Failed to create user'));

      expect(prismaService.users.create).not.toHaveBeenCalled(); 
    });

    describe('findById', () => {
      it('should return a user by ID', async () => {
        const userMock = AuthentificationMock.user;

        mockPrismaUsers.findUnique.mockResolvedValue(userMock);

        const result = await userService.findById(userMock.id);
        expect(prismaService.users.findUnique).toHaveBeenCalledWith({
          where: { id: userMock.id },
        });
        expect(result).toEqual(userMock);
      });
      it('should throw NotFoundException if user is not found', async () => {
        mockPrismaUsers.findUnique.mockResolvedValue(null);

        await expect(userService.findById('non-existent-id')).rejects.toThrow(
          NotFoundException,
        );
      });
      it('should throw NotFoundException on database errors', async () => {
        mockPrismaUsers.findUnique.mockRejectedValue(new Error('Database error'));

        await expect(userService.findById('error-id')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('findByEmail', () => {
      it('should return a user by email', async () => {
        const mockUser = {
          id: '0fe3dbd4-aee0-47db-ac4e-56e2e3382a15',
          email: 'johndoe@example.com',
        } as any;

        mockPrismaUsers.findUnique.mockResolvedValue(mockUser);

        const result = await userService.findByEmail(
          MocksUserService.userFindByEmail.email,
        );
        expect(prismaService.users.findUnique).toHaveBeenCalledWith({
          where: { email: MocksUserService.userFindByEmail.email },
        });
        expect(result).toEqual(mockUser);
      });

      it('should return null if no user is found', async () => {
        mockPrismaUsers.findUnique.mockResolvedValue(null);

        const result = await userService.findByEmail('nonexistent@example.com');
        expect(prismaService.users.findUnique).toHaveBeenCalledWith({
          where: { email: 'nonexistent@example.com' },
        });
        expect(result).toBeNull();
      });

      it('should throw an error if an exception occurs', async () => {
        mockPrismaUsers.findUnique.mockRejectedValue(new Error('Database error'));

        await expect(
          userService.findByEmail('error@example.com'),
        ).rejects.toThrow('Database error');
      });
    });
    describe('hashPass', () => {
      it('should hash the password', async () => {
        const plainPassword = 'password123';
        const hashedPassword = 'hashedpassword123';
        (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

        const result = await userService.hashPass(plainPassword);

        expect(result).toEqual(hashedPassword);
      });
      it('should throw InternalServerErrorException if hashing fails', async () => {
        (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash error'));

        await expect(userService.hashPass('password123')).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });

    describe('getUserRole', () => {
      it('should return the user role for a valid user ID', async () => {
        const userMock = AuthentificationMock.user;
        const userRoleMock = AuthentificationMock.userRole;
        jest.spyOn(userService, 'findById').mockResolvedValue(userMock as any);
        mockPrismaUserRoles.findUnique.mockResolvedValue(userRoleMock);

        const result = await userService.getUserRole(userMock.id);
        expect(userService.findById).toHaveBeenCalledWith(userMock.id);
        expect(prismaService.userRoles.findUnique).toHaveBeenCalledWith({
          where: { id: userMock.roleId },
        });
        expect(result).toEqual(userRoleMock);
      });
      it('should throw NotFoundException if user role is not found', async () => {
        const userMock = AuthentificationMock.user;
        jest.spyOn(userService, 'findById').mockResolvedValue(userMock as any);
        mockPrismaUserRoles.findUnique.mockResolvedValue(null);
        await expect(userService.getUserRole(userMock.id)).rejects.toThrow(
          NotFoundException,
        );
      });
      it('should throw NotFoundException if fetching user by ID fails', async () => {
        jest
          .spyOn(userService, 'findById')
          .mockRejectedValue(new NotFoundException('User not found'));

        await expect(userService.getUserRole('invalid-id')).rejects.toThrow(
          NotFoundException,
        );
      });
    });
    describe('resetPass', () => {
      it('should reset the user password successfully', async () => {
        const verificationToken = 'valid-verification-token';
        const newPassword = 'hashedpassword123';
        const tokenMock = { id: 'token-id', userId: 'user-id' };
        mockTokenService.findAuthToken.mockResolvedValue(tokenMock);
        mockPrismaUsers.update.mockResolvedValue(true as any);
        mockPrismaVerificationTokens.update.mockResolvedValue(true);

        const result = await userService.resetPass(
          verificationToken,
          newPassword,
        );
        expect(tokenService.findAuthToken).toHaveBeenCalledWith(
          verificationToken,
        );
        expect(prismaService.users.update).toHaveBeenCalledWith({
          where: { id: tokenMock.userId },
          data: { password: newPassword },
        });
        expect(prismaService.verificationTokens.update).toHaveBeenCalledWith({
          where: { id: tokenMock.id },
          data: { consumed: true },
        });
        expect(result).toBe(true);
      });
      it('should throw InternalServerErrorException if password reset fails', async () => {
        mockTokenService.findAuthToken.mockRejectedValue(
          new Error('Token error'),
        );

        await expect(
          userService.resetPass('invalid-token', 'hashedpassword123'),
        ).rejects.toThrow(InternalServerErrorException);
      });
    });
  });
});