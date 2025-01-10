import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerContextGuard } from './throttler.context.guard';
import { ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

describe('ThrottlerBase dOnContextGuard', () => {
  let guard: ThrottlerContextGuard;
  let mockOptions: ThrottlerModuleOptions;
  let mockStorage: ThrottlerStorage;
  let reflector: Reflector;

  beforeEach(() => {
    mockOptions = { throttlers: [] };

    reflector = new Reflector();

    guard = new ThrottlerContextGuard(mockOptions, mockStorage, reflector);
  });

  it('should return request and response objects for HTTP context', () => {
    const mockRequest = { user: { id: 1 } };
    const mockResponse = { statusCode: 200 };

    const mockHttpContext = {
      getRequest: jest.fn().mockReturnValue(mockRequest),
      getResponse: jest.fn().mockReturnValue(mockResponse),
    };

    const mockExecutionContext = {
      getType: jest.fn().mockReturnValue('http'),
      switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
    } as unknown as ExecutionContext;

    const result = guard.getRequestResponse(mockExecutionContext);

    expect(result).toEqual({ req: mockRequest, res: mockResponse });
    expect(mockExecutionContext.getType).toHaveBeenCalledTimes(1);
    expect(mockExecutionContext.switchToHttp).toHaveBeenCalledTimes(1);
    expect(mockHttpContext.getRequest).toHaveBeenCalledTimes(1);
    expect(mockHttpContext.getResponse).toHaveBeenCalledTimes(1);
  });

  it('should return request and response objects for GraphQL context', () => {
    const mockRequest = { user: { id: 2 } };
    const mockResponse = { statusCode: 201 };

    const mockGraphqlContext = {
      getContext: jest
        .fn()
        .mockReturnValue({ request: mockRequest, response: mockResponse }),
    };

    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue(mockGraphqlContext as unknown as GqlExecutionContext);

    const mockExecutionContext = {
      getType: jest.fn().mockReturnValue('graphql'),
    } as unknown as ExecutionContext;

    const result = guard.getRequestResponse(mockExecutionContext);

    expect(result).toEqual({ req: mockRequest, res: mockResponse });
    expect(mockExecutionContext.getType).toHaveBeenCalledTimes(1);
    expect(GqlExecutionContext.create).toHaveBeenCalledWith(
      mockExecutionContext,
    );
    expect(mockGraphqlContext.getContext).toHaveBeenCalledTimes(1);
  });

  it('should throw UnauthorizedException for unsupported context type', () => {
    const mockExecutionContext = {
      getType: jest.fn().mockReturnValue('rpc'),
    } as unknown as ExecutionContext;

    expect(() => guard.getRequestResponse(mockExecutionContext)).toThrow(
      new UnauthorizedException('Unsupported context type: rpc'),
    );

    expect(mockExecutionContext.getType).toHaveBeenCalledTimes(1);
  });
});
