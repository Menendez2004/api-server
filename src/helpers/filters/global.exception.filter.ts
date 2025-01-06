import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
    ContextType,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { GraphQLError } from 'graphql';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const contextType = host.getType();

        if (contextType === 'graphql' as ContextType) {
            this.handleGraphQLException(exception, host);
        } else if (contextType === 'http') {
            this.handleHttpException(exception, host);
        } else {
            this.logger.error(
                `Unhandled exception in context type ${contextType}: ${this.extractErrorMessage(exception)}`,
            );
        }
    }

    private handleGraphQLException(exception: unknown, host: ArgumentsHost): void {
        const gqlHost = GqlArgumentsHost.create(host);
        const info = gqlHost.getInfo();

        const { message, stack, status, code } = this.extractErrorDetails(exception);

        this.logger.error(
            `GraphQL Exception in query "${info.fieldName}": ${message}`,
            stack,
        );

        throw new GraphQLError(message, {
            extensions: {
                code: code || 'InternalServerError',
                date: new Date().toISOString(),
                status,
            },
        });
    }

    private handleHttpException(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const { message, stack, status, code } = this.extractErrorDetails(exception);

        this.logger.error(
            `HTTP Exception for ${request.method} ${request.url}: ${message}`,
            stack,
        );

        response.status(status).json({
            errors: [
                {
                    message,
                    extensions: {
                        code: code || 'InternalServerError',
                        date: new Date().toISOString(),
                        status,
                        path: request.url,
                        method: request.method,
                    },
                },
            ],
        });
    }

    private extractErrorDetails(exception: unknown): {
        message: string;
        stack?: string;
        status: number;
        code?: string;
    } {
        const message = this.extractErrorMessage(exception);
        const stack = exception instanceof  Error && !(exception instanceof HttpException)
        ? exception.stack : undefined;
        const status = this.extractHttpStatus(exception);
        const code = this.extractErrorCode(exception);

        return { message, stack, status, code };
    }

    private extractErrorMessage(exception: unknown): string {
        if (exception instanceof HttpException) {
            const response = exception.getResponse();
            return typeof response === 'string'
                ? response
                : response['message'] || 'An unexpected error occurred';
        }
        return exception instanceof Error ? exception.message : 'Unknown error';
    }

    private extractErrorStack(exception: unknown): string | undefined {
        return exception instanceof Error ? exception.stack : undefined;
    }

    private extractHttpStatus(exception: unknown): number {
        return exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private extractErrorCode(exception: unknown): string | undefined {
        if (exception instanceof HttpException) {
            const response = exception.getResponse();
            return typeof response === 'string' ? undefined : response['error'];
        }
        return undefined;
    }
}
