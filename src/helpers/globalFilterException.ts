import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class globalFilterException implements ExceptionFilter {
    private readonly logger = new Logger(globalFilterException.name);

    catch(exception: unknown, host: ArgumentsHost) {
        if (host.getType() !== 'http') {
            this.logger.warn('Non-HTTP context detected, skipping exception handling.');
            return;
        }

        const { request, response } = this.getHttpContext(host);

        const statusCode = this.resolveStatusCode(exception);
        const errorMessage = this.resolveErrorMessage(exception);

        const errorResponse = {
            statusCode,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            error: errorMessage,
        };

        this.logError(exception, request, errorResponse);
        response.status(statusCode).json(errorResponse);
    }

    private getHttpContext(host: ArgumentsHost) {
        const httpContext = host.switchToHttp();
        return {
            request: httpContext.getRequest<Request>(),
            response: httpContext.getResponse<Response>(),
        };
    }

    private resolveStatusCode(exception: unknown): number {
        if (exception instanceof HttpException) {
            return exception.getStatus();
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private resolveErrorMessage(exception: unknown): string | object {
        if (exception instanceof HttpException) {
            const response = exception.getResponse();
            return typeof response === 'string' ? response : response['message'] || 'Unknown error';
        }
        return 'Internal server error';
    }

    private logError(exception: unknown, request: Request, errorResponse: any): void {
        const logDetails = {
            method: request.method,
            url: request.url,
            statusCode: errorResponse.statusCode,
            message: errorResponse.error,
        };

        if (exception instanceof HttpException) {
            this.logger.error(`Handled HTTP Exception`, logDetails);
        } else {
            this.logger.error(`Unhandled Exception`, {
                ...logDetails,
                stack: exception instanceof Error ? exception.stack : 'No stack trace available',
            });
        }
    }
}
