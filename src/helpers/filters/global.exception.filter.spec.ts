import { GlobalExceptionFilter } from './global.exception.filter';
import { ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { Response, Request } from 'express';
import { GraphQLError } from 'graphql';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: jest.fn().mockImplementation(() => ({
    error: jest.fn(),
  })),
}));

describe('GlobalExceptionFilter', () => {
  let exceptionFilter: GlobalExceptionFilter;
  let mockArgumentsHost: Partial<ArgumentsHost>;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    exceptionFilter = new GlobalExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = {
      method: 'GET',
      url: '/test',
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getType: jest.fn(),
    };
  });

  it('should handle HTTP exceptions correctly', () => {
    const exception = new HttpException('Test Error', HttpStatus.BAD_REQUEST);
    mockArgumentsHost.getType = jest.fn().mockReturnValue('http');

    exceptionFilter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockArgumentsHost.switchToHttp).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      errors: [
        {
          message: 'Test Error',
          extensions: {
            code: 'InternalServerError',
            date: expect.any(String),
            status: HttpStatus.BAD_REQUEST,
            path: mockRequest.url,
            method: mockRequest.method,
          },
        },
      ],
    });
  });

  it('should handle GraphQL exceptions correctly', () => {
    const exception = new Error('GraphQL Test Error');
    const mockInfo = { fieldName: 'testField' };
    const mockGqlHost = {
      getInfo: jest.fn().mockReturnValue(mockInfo),
      getContext: jest.fn().mockReturnValue({}),
    };
    jest.spyOn(GqlArgumentsHost, 'create').mockReturnValue(mockGqlHost as any);
    mockArgumentsHost.getType = jest.fn().mockReturnValue('graphql');

    expect(() => exceptionFilter.catch(exception, mockArgumentsHost as ArgumentsHost)).toThrowError(
      new GraphQLError('GraphQL Test Error', {
        extensions: {
          code: 'InternalServerError',
          date: expect.any(String),
          status: 500,
        },
      }),
    );

    expect(GqlArgumentsHost.create).toHaveBeenCalledWith(mockArgumentsHost);
    expect(mockGqlHost.getInfo).toHaveBeenCalled();
  });

  it('should log unhandled context types', () => {
    const exception = new Error('Unhandled Context Error');
    jest.spyOn(mockArgumentsHost, 'getType').mockReturnValue('unknown');

    const mockLogger = new Logger();
    jest.spyOn(mockLogger, 'error');

    // Inject the mocked logger into the filter
    (exceptionFilter as any).logger = mockLogger;

    exceptionFilter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockArgumentsHost.getType).toHaveBeenCalled();

    expect(mockLogger.error).toHaveBeenCalledWith(
      `Unhandled exception in context type unknown: ${exception.message}`
    );
  });


  it('should extract error details correctly', () => {

    const httpException = new HttpException('HTTP Error', HttpStatus.NOT_FOUND);
    const httpDetails = (exceptionFilter as any).extractErrorDetails(httpException);

    expect(httpDetails).toEqual({
      message: 'HTTP Error',
      stack: undefined,
      status: HttpStatus.NOT_FOUND,
      code: undefined,
    });

    const genericError = new Error('Generic Error');
    const genericDetails = (exceptionFilter as any).extractErrorDetails(genericError);

    expect(genericDetails).toEqual({
      message: 'Generic Error',
      stack: expect.any(String), // Generic errors include a stack
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: undefined,
    });

    const unknownError = { customMessage: 'Custom Error' }; // Simulate a non-standard error
    const unknownDetails = (exceptionFilter as any).extractErrorDetails(unknownError);

    expect(unknownDetails).toEqual({
      message: 'Unknown error',
      stack: undefined,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: undefined,
    });
  });




});
