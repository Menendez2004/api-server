import {
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';
import { HandleContext } from '../../helpers/filters/context.helper.filter';

jest.mock('../../helpers/filters/context.helper.filter', () => ({
  HandleContext: jest.fn(),
}));

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let mockLoggerError: jest.SpyInstance;

  beforeEach(() => {
    jwtAuthGuard = new JwtAuthGuard();
    mockLoggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation();
  });

  afterEach(() => {
    mockLoggerError.mockRestore();
  });

  describe('getRequest', () => {
    it('should call HandleContext with the given context and return the result', async () => {
      const mockContext = {} as ExecutionContext;
      const mockRequest = { user: { id: 1 } };
      (HandleContext as jest.Mock).mockResolvedValue(mockRequest);

      const result = await jwtAuthGuard.getRequest(mockContext);

      expect(HandleContext).toHaveBeenCalledWith(mockContext);
      expect(result).toBe(mockRequest);
    });

    it('should throw an error if HandleContext fails', async () => {
      const mockContext = {} as ExecutionContext;
      (HandleContext as jest.Mock).mockRejectedValue(
        new Error('HandleContext error'),
      );

      await expect(jwtAuthGuard.getRequest(mockContext)).rejects.toThrow(
        'HandleContext error',
      );
    });
  });

  describe('handleRequest', () => {
    it('should return the user if no errors and user is present', () => {
      const mockUser = { id: 1, name: 'John Doe' };
      const result = jwtAuthGuard.handleRequest(null, mockUser, null);
      expect(result).toBe(mockUser);
    });

    it('should throw UnauthorizedException if there is no user', () => {
      expect(() => jwtAuthGuard.handleRequest(null, null, null)).toThrow(
        new UnauthorizedException('Unauthorized'),
      );
    });

    it('should throw the error if one is provided', () => {
      const mockError = new Error('Auth error');
      expect(() => jwtAuthGuard.handleRequest(mockError, null, null)).toThrow(
        mockError,
      );
    });

    it('should log the error and info if authentication fails', () => {
      const mockError = new Error('Auth error');

      try {
        jwtAuthGuard.handleRequest(mockError, null, 'Invalid token');
      } catch {}

      expect(mockLoggerError).toHaveBeenCalledWith(
        'Unauthorized access attempt',
        mockError || 'Invalid token',
      );
    });
  });
});
