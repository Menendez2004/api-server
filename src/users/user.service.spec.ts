import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { UsersService } from './users.service';
import { TokenService } from '../token/token.service';
import { AuthentificationMock } from '../../test/mocks/authentication.mocks';
import { MocksUserService } from '../../test/mocks/user.create.mocks';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('UsersService', () => {
  let userService: UsersService;
  let prismaService: PrismaService;
  let tokenService: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            users: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            userRoles: {
              findUnique: jest.fn(),
            },
            verificationTokens: {
              update: jest.fn(),
            },
          },
        },
        {
          provide: TokenService,
          useValue: {
            findAuthToken: jest.fn(),
            encodeToken: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    tokenService = module.get<TokenService>(TokenService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('this should create a new user', async () => {
      const userMock = {
        id: '0fe3dbd4-aee0-47db-ac4e-56e2e3382a15',
        email: 'johndoe@example.com',
      } as any;
      jest.spyOn(prismaService.users, 'create').mockResolvedValue(userMock);

      const result = await userService.createUser(MocksUserService.user);
      expect(prismaService.users.create).toHaveBeenCalledWith({
        data: MocksUserService.userCreate,
      });
      expect(result).toEqual(userMock);
    });

    it('this should return an error if the user creation fails  ', async () => {
      jest
        .spyOn(prismaService.users, 'create')
        .mockRejectedValue(new Error('Error creating user'));
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      const userMock = AuthentificationMock.user;
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(userMock);
      const result = await userService.findById(userMock.id);
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { id: userMock.id },
      });
      expect(result).toEqual(userMock);
    });
    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(null);
      await expect(userService.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should throw NotFoundException on database errors', async () => {
      jest
        .spyOn(prismaService.users, 'findUnique')
        .mockRejectedValue(new Error('Database error'));
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
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(mockUser);
      const result = await userService.findByEmail(
        MocksUserService.userFindByEmail.email,
      );
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { email: MocksUserService.userFindByEmail.email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if no user is found', async () => {
      jest.spyOn(prismaService.users, 'findUnique').mockResolvedValue(null);
      const result = await userService.findByEmail('nonexistent@example.com');
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
      expect(result).toBeNull();
    });

    it('should throw an error if an exception occurs', async () => {
      jest
        .spyOn(prismaService.users, 'findUnique')
        .mockRejectedValue(new Error('Database error'));
      await expect(
        userService.findByEmail('error@example.com'),
      ).rejects.toThrow('Database error');
    });
  });
  describe('hashPass', () => {
    it('should hash the password', async () => {
      const plainPassword = 'password123';
      const hashedPassword = 'hashedpassword123';
      jest.spyOn(require('bcrypt'), 'hash').mockResolvedValue(hashedPassword);
      const result = await userService.hashPass(plainPassword);
      expect(result).toEqual(hashedPassword);
    });
    it('should throw InternalServerErrorException if hashing fails', async () => {
      jest
        .spyOn(require('bcrypt'), 'hash')
        .mockRejectedValue(new Error('Hashing error'));
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
      jest
        .spyOn(prismaService.userRoles, 'findUnique')
        .mockResolvedValue(userRoleMock);
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
      jest.spyOn(prismaService.userRoles, 'findUnique').mockResolvedValue(null);
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
      jest
        .spyOn(tokenService, 'findAuthToken')
        .mockResolvedValue(tokenMock as any);
      jest.spyOn(prismaService.users, 'update').mockResolvedValue(true as any);
      jest
        .spyOn(prismaService.verificationTokens, 'update')
        .mockResolvedValue(true as any);
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
      jest
        .spyOn(tokenService, 'findAuthToken')
        .mockRejectedValue(new Error('Token error'));
      await expect(
        userService.resetPass('invalid-token', 'hashedpassword123'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
