import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { AuthentificationMock } from '../../test/mocks/authentication.mocks';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let mockedUsersService: jest.Mocked<UsersService>;
  let mockedJwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      getUserRole: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    mockedUsersService = module.get(UsersService);
    mockedJwtService = module.get(JwtService);
  });

  describe('login', () => {
    it('should return the access token to get credentials', async () => {
      mockedUsersService.getUserRole.mockResolvedValue(
        AuthentificationMock.userRole,
      );
      mockedJwtService.sign.mockReturnValue(AuthentificationMock.accesToken);

      const result = await authService.login(AuthentificationMock.user);
      expect(result).toEqual({ accessToken: AuthentificationMock.accesToken });
    });
  });

  describe('verifyCredentials', () => {
    it('should throw an UnauthorizedException if the user is not registered', async () => {
      mockedUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.verifyCredentials('johndoe@example.com', 'password123'),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw an UnauthorizedException if the password is incorrect', async () => {
      // Setup mocks
      mockedUsersService.findByEmail.mockResolvedValue(
        AuthentificationMock.user,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.verifyCredentials('johndoe@example.com', 'wrongpassword'),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should return the user if the credentials are correct', async () => {
      mockedUsersService.findByEmail.mockResolvedValue(
        AuthentificationMock.user,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.verifyCredentials(
        'johndoe@example.com',
        'hashedpassword123',
      );

      expect(result).toEqual(AuthentificationMock.user);
    });
  });

  describe('verifyPass', () => {
    it('should', () => {});
  });
});
