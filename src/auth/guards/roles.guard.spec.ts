import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

class ReflectorMock {
  get = jest.fn();
  getAll = jest.fn();
  getAllAndMerge = jest.fn();
  getAllAndOverride = jest.fn();
}

describe('RolesGuard', () => {
  let service: RolesGuard;
  let reflector: ReflectorMock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesGuard],
      providers: [
        {
          provide: Reflector,
          useClass: ReflectorMock,
        },
      ],
    }).compile();

    service = module.get(RolesGuard);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('canActivate', () => {
    it('should', () => {

    });
  });
});