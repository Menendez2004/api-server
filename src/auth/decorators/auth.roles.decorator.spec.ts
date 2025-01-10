import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../guards/roles.guard';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { RoleName } from '@prisma/client';
import { AuthRole } from './auth.roles.decorator';

describe('AuthRole Decorator', () => {
  let rolesGuard: RolesGuard;
  let jwtAuthGuard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('Decorator composition', () => {
    // Mock class to test the decorator
    class TestClass {
      @AuthRole(RoleName.MANAGER)
      testMethod() {}
    }

    it('should set metadata with the correct roles', () => {
      // Create instance of test class
      const test = new TestClass();

      // Get the metadata from the method
      const roles = Reflect.getMetadata('roles', test.testMethod);

      expect(roles).toEqual([RoleName.MANAGER]);
    });

    it('should apply multiple roles correctly', () => {
      class MultiRoleTest {
        @AuthRole(RoleName.MANAGER, RoleName.CLIENT)
        testMethod() {}
      }

      const test = new MultiRoleTest();
      const roles = Reflect.getMetadata('roles', test.testMethod);

      expect(roles).toEqual([RoleName.MANAGER, RoleName.CLIENT]);
    });
  });

  describe('Guard integration', () => {
    it('should allow access when JWT and roles are valid', async () => {
      const context = createMockExecutionContext({
        user: { role: RoleName.MANAGER },
      });

      (jwtAuthGuard.canActivate as jest.Mock).mockResolvedValue(true);
      (reflector.get as jest.Mock).mockReturnValue([RoleName.MANAGER]);

      const result = rolesGuard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should deny access when JWT is invalid', async () => {
      const context = createMockExecutionContext({
        user: { role: RoleName.MANAGER },
      });

      (jwtAuthGuard.canActivate as jest.Mock).mockRejectedValue(
        new UnauthorizedException('Invalid token'),
      );

      await expect(jwtAuthGuard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should deny access when role is invalid', async () => {
      const context = createMockExecutionContext({
        user: {},
      });

      (jwtAuthGuard.canActivate as jest.Mock).mockResolvedValue(true);
      (reflector.get as jest.Mock).mockReturnValue([RoleName.MANAGER]);

      expect(() => rolesGuard.canActivate(context)).toThrow(
        UnauthorizedException,
      );
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
