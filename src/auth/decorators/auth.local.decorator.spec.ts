import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { LocalAuthGuard } from '../guards/auth.local.guard';
import { AuthLocal } from './auth.local.decorator';

describe('AuthLocal Decorator', () => {
  let localAuthGuard: LocalAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LocalAuthGuard,
          useValue: {
            canActivate: jest.fn(),
          },
        },
      ],
    }).compile();

    localAuthGuard = module.get<LocalAuthGuard>(LocalAuthGuard);
  });

  describe('Decorator composition', () => {
    class TestController {
      @AuthLocal()
      testMethod() {
        return 'test';
      }
    }

    it('should apply LocalAuthGuard to the method', () => {
      const test = new TestController();
      const guards = Reflect.getMetadata('__guards__', test.testMethod);

      expect(guards).toBeDefined();
      expect(guards.length).toBe(1);
      expect(new guards[0]()).toBeInstanceOf(LocalAuthGuard);
    });
  });

  describe('Guard integration', () => {
    it('should allow access when credentials are valid', async () => {
      const context = createMockExecutionContext({
        body: {
          username: 'testuser',
          password: 'testpass',
        },
      });

      (localAuthGuard.canActivate as jest.Mock).mockResolvedValue(true);

      const result = await localAuthGuard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should deny access when credentials are invalid', async () => {
      const context = createMockExecutionContext({
        body: {
          username: 'invalid',
          password: 'invalid',
        },
      });

      (localAuthGuard.canActivate as jest.Mock).mockResolvedValue(false);

      const result = await localAuthGuard.canActivate(context);
      expect(result).toBe(false);
    });

    it('should handle missing credentials', async () => {
      const context = createMockExecutionContext({
        body: {},
      });

      (localAuthGuard.canActivate as jest.Mock).mockResolvedValue(false);

      const result = await localAuthGuard.canActivate(context);
      expect(result).toBe(false);
    });
  });
});

function createMockExecutionContext(request: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: jest.fn(),
    getType: jest.fn(() => 'http'),
  } as unknown as ExecutionContext;
}
