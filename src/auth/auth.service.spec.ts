import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { AuthentificationMock } from '../../test/mocks/authentication.mocks';
jest.mock('bcrypt');



describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            getUserRole: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });


  describe('login', () => {
    it('should be return the access token to get credentials ', async () => {
      jest.spyOn(usersService, 'getUserRole').mockResolvedValue(AuthentificationMock.userRole);
      jest.spyOn(jwtService, 'sign').mockReturnValue(AuthentificationMock.accesToken)

      const result = await authService.login(AuthentificationMock.user);
      expect(result).toEqual({ accessToken: AuthentificationMock.accesToken });
    });
  });


  describe('verifyCredentials', () => {
    it('should throw an UnauthorizedException if the user is not registered', async () => {
        jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

        await expect(
            authService.verifyCredentials('johndoe@example.com', 'password123'),
        ).rejects.toThrow('Invalid credentials');
    });

    it('should throw an UnauthorizedException if the password is incorrect', async () => {
        jest.spyOn(usersService, 'findByEmail').mockResolvedValue(AuthentificationMock.user);
        jest.spyOn(bcrypt, 'compare').mockImplementation(async (): Promise<Boolean> => false);

        await expect(
            authService.verifyCredentials('johndoe@example.com', 'wrongpassword'),
        ).rejects.toThrow('Invalid credentials');
    });

    it('should return the user if the credentials are correct', async () => {
        jest.spyOn(usersService, 'findByEmail').mockResolvedValue(AuthentificationMock.user);
        jest.spyOn(bcrypt, 'compare').mockImplementation(async (): Promise<Boolean> => true);

        const result = await authService.verifyCredentials(
            'johndoe@example.com',
            'hashedpassword123',
        );

        expect(result).toEqual(AuthentificationMock.user);
    });
});




  describe('verifyPass', () => {
    it('should', () => {

    });
  });
});