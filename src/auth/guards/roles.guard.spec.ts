import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { HandleContext } from '../../helpers/filters/context.helper.filter';

jest.mock('../../helpers/filters/context.helper.filter', () => ({
  HandleContext: jest.fn(),
}));

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  it('should return true if no roles are required', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);

    const mockExecutionContext = {
      getHandler: jest.fn().mockReturnValue(() => {}),
    } as unknown as ExecutionContext;

    const result = rolesGuard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(reflector.get).toHaveBeenCalledWith('roles', expect.any(Function));
  });

  it('should return true if the user has a required role', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['MANAGER', 'CLIENT']);
    (HandleContext as jest.Mock).mockReturnValue({
      user: { role: 'MANAGER' },
    });

    const mockExecutionContext = {
      getHandler: jest.fn().mockReturnValue(() => {}),
    } as unknown as ExecutionContext;

    const result = rolesGuard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(reflector.get).toHaveBeenCalledWith('roles', expect.any(Function));
    expect(HandleContext).toHaveBeenCalledWith(mockExecutionContext);
  });

  it('should throw UnauthorizedException if the user or role is missing', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['MANAGER', 'CLIENT']);
    (HandleContext as jest.Mock).mockReturnValue({});

    const mockExecutionContext = {
      getHandler: jest.fn().mockReturnValue(() => {}),
    } as unknown as ExecutionContext;

    expect(() => rolesGuard.canActivate(mockExecutionContext)).toThrow(
      new UnauthorizedException('User not authenticated or role missing'),
    );

    expect(reflector.get).toHaveBeenCalledWith('roles', expect.any(Function));
    expect(HandleContext).toHaveBeenCalledWith(mockExecutionContext);
  });
});
