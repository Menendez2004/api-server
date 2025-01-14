import { GlobalExceptionFilter } from './global.exception.filter';
import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
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

    expect(() =>
      exceptionFilter.catch(exception, mockArgumentsHost as ArgumentsHost),
    ).toThrowError(
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

    (exceptionFilter as any).logger = mockLogger;

    exceptionFilter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockArgumentsHost.getType).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(
      `Unhandled exception in context type unknown: ${exception.message}`,
    );
  });

  it('should extract error details correctly', () => {
    const httpException = new HttpException('HTTP Error', HttpStatus.NOT_FOUND);
    const httpDetails = (exceptionFilter as any).extractErrorDetails(
      httpException,
    );

    expect(httpDetails).toEqual({
      message: 'HTTP Error',
      stack: undefined,
      status: HttpStatus.NOT_FOUND,
      code: undefined,
    });

    const genericError = new Error('Generic Error');
    const genericDetails = (exceptionFilter as any).extractErrorDetails(
      genericError,
    );

    expect(genericDetails).toEqual({
      message: 'Generic Error',
      stack: expect.any(String),
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: undefined,
    });

    const unknownError = { customMessage: 'Custom Error' };
    const unknownDetails = (exceptionFilter as any).extractErrorDetails(
      unknownError,
    );

    expect(unknownDetails).toEqual({
      message: 'Unknown error',
      stack: undefined,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: undefined,
    });
  });

  describe('extractErrorStack', () => {
    it('should return stack trace for Error instances', () => {
      const error = new Error('Test error');
      const stack = (exceptionFilter as any).extractErrorStack(error);
      expect(stack).toBeDefined();
      expect(stack).toBe(error.stack);
    });

    it('should return undefined for non-Error instances', () => {
      const nonError = { message: 'Not an error' };
      const stack = (exceptionFilter as any).extractErrorStack(nonError);
      expect(stack).toBeUndefined();
    });

    it('should return undefined for null or undefined', () => {
      expect((exceptionFilter as any).extractErrorStack(null)).toBeUndefined();
      expect(
        (exceptionFilter as any).extractErrorStack(undefined),
      ).toBeUndefined();
    });

    it('should return undefined for primitive values', () => {
      expect(
        (exceptionFilter as any).extractErrorStack('string'),
      ).toBeUndefined();
      expect((exceptionFilter as any).extractErrorStack(123)).toBeUndefined();
      expect((exceptionFilter as any).extractErrorStack(true)).toBeUndefined();
    });
  });

  describe('extractErrorDetails with stack traces', () => {
    it('should extract stack trace correctly for standard Error', () => {
      const error = new Error('Test error');
      const details = (exceptionFilter as any).extractErrorDetails(error);
      expect(details.stack).toBe(error.stack);
    });

    it('should not include stack trace for HttpException', () => {
      const httpError = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      const details = (exceptionFilter as any).extractErrorDetails(httpError);
      expect(details.stack).toBeUndefined();
    });

    it('should handle nested error objects', () => {
      const nestedError = {
        error: new Error('Nested error'),
      };
      const details = (exceptionFilter as any).extractErrorDetails(nestedError);
      expect(details.stack).toBeUndefined();
      expect(details.message).toBe('Unknown error');
    });
  });

  describe('extractErrorMessage', () => {
    it('should extract message from HttpException with string response', () => {
      const exception = new HttpException(
        'Test message',
        HttpStatus.BAD_REQUEST,
      );
      const message = (exceptionFilter as any).extractErrorMessage(exception);
      expect(message).toBe('Test message');
    });

    it('should extract message from HttpException with object response', () => {
      const exception = new HttpException(
        { message: 'Test message', error: 'Bad Request' },
        HttpStatus.BAD_REQUEST,
      );
      const message = (exceptionFilter as any).extractErrorMessage(exception);
      expect(message).toBe('Test message');
    });
  });

  describe('extractErrorCode', () => {
    it('should extract error code from HttpException with object response', () => {
      const exception = new HttpException(
        { message: 'Test message', error: 'CustomError' },
        HttpStatus.BAD_REQUEST,
      );
      const code = (exceptionFilter as any).extractErrorCode(exception);
      expect(code).toBe('CustomError');
    });

    it('should return undefined for HttpException with string response', () => {
      const exception = new HttpException(
        'Test message',
        HttpStatus.BAD_REQUEST,
      );
      const code = (exceptionFilter as any).extractErrorCode(exception);
      expect(code).toBeUndefined();
    });

    it('should return undefined for non-HttpException', () => {
      const error = new Error('Test error');
      const code = (exceptionFilter as any).extractErrorCode(error);
      expect(code).toBeUndefined();
    });
  });
});
