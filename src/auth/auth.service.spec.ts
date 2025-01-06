import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

class UsersServiceMock {
  createUser = jest.fn();
  hashPass = jest.fn();
  findById = jest.fn();
  findByEmail = jest.fn();
  getUserRole = jest.fn();
  resetPass = jest.fn();
}

class JwtServiceMock {
  sign = jest.fn();
  signAsync = jest.fn();
  verify = jest.fn();
  verifyAsync = jest.fn();
  decode = jest.fn();
}

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersServiceMock;
  let jwtService: JwtServiceMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthService],
      providers: [
        {
          provide: UsersService,
          useClass: UsersServiceMock,
        },
        {
          provide: JwtService,
          useClass: JwtServiceMock,
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should', () => {

    });
  });

  describe('verifyCredentials', () => {
    it('should', () => {

    });
  });

  describe('verifyPass', () => {
    it('should', () => {

    });
  });
});