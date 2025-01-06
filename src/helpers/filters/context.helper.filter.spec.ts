import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { HandleContext } from './context.helper.filter'; // Update with the correct file path

describe('HandleContext', () => {
    let mockExecutionContext: Partial<ExecutionContext>;

    beforeEach(() => {
        mockExecutionContext = {
            getType: jest.fn(),
            switchToHttp: jest.fn(),
        };
    });

    it('should return the request object for HTTP context', () => {
        const mockRequest = { user: { id: 1 } };

        
        const mockHttp = { getRequest: jest.fn().mockReturnValue(mockRequest) };
        mockExecutionContext.getType = jest.fn().mockReturnValue('http');
        mockExecutionContext.switchToHttp = jest.fn().mockReturnValue(mockHttp);

        const result = HandleContext(mockExecutionContext as ExecutionContext);

        expect(mockExecutionContext.getType).toHaveBeenCalled();
        expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
        expect(mockHttp.getRequest).toHaveBeenCalled();
        expect(result).toBe(mockRequest);
    });

    it('should return the request object for GraphQL context', () => {
        const mockRequest = { user: { id: 2 } };

        const mockGqlContext = {
            getContext: jest.fn().mockReturnValue({ request: mockRequest }),
        };
        jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlContext as any);
        mockExecutionContext.getType = jest.fn().mockReturnValue('graphql');

        const result = HandleContext(mockExecutionContext as ExecutionContext);

        expect(mockExecutionContext.getType).toHaveBeenCalled();
        expect(GqlExecutionContext.create).toHaveBeenCalledWith(mockExecutionContext);
        expect(mockGqlContext.getContext).toHaveBeenCalled();
        expect(result).toBe(mockRequest);
    });

    it('should throw an UnauthorizedException for unsupported context type', () => {
        const unsupportedType = 'unsupported';
        mockExecutionContext.getType = jest.fn().mockReturnValue(unsupportedType);

        expect(() => HandleContext(mockExecutionContext as ExecutionContext)).toThrow(
            new UnauthorizedException(`Unsupported context type: ${unsupportedType}`),
        );

        expect(mockExecutionContext.getType).toHaveBeenCalled();
    });
});
