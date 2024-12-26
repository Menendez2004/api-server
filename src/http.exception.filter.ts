import {
    HttpException,
    Catch, ExceptionFilter,
    ArgumentsHost,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException
} from "@nestjs/common";



@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<any>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        let errorMessage = exception.message;


        const errorMessages = {
            [NotFoundException.name]: `Resource not found: ${errorMessage}`,
            [BadRequestException.name]: `Bad request: ${errorMessage}`,
            [InternalServerErrorException.name]: `Internal server error: ${errorMessage}`,
        };

        errorMessage = errorMessages[exception.constructor.name] || `An error occurred: ${errorMessage}`;

        response
            .status(status)
            .json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                method: request.method,
                path: request.url,
                error: exception.message

            });
    }
}

