import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { extractRequestFromContext } from '../../helpers/context.helper';

@Injectable()

export class JwtAuthGuard extends AuthGuard('jwt') {
    /**
     * JwtAuthGuard extends the default AuthGuard to handle JWT-based authentication.
     * It customizes the extraction of the request object from the execution context.
     * 
     * @class
     * @extends {AuthGuard('jwt')}
     * 
     * @method getRequest
     * @async
     * @param {ExecutionContext} context - The execution context provided by NestJS.
     * @returns {Promise<any>} - The extracted request object.
     * @throws {UnauthorizedException} - If the request extraction fails or an error occurs.
     */
    async getRequest(context: ExecutionContext): Promise<any> {
        try {
            const request = await extractRequestFromContext(context);
            if (!request) {
                throw new UnauthorizedException('Failed to extract request from context.');
            }
            return request;
        } catch (error) {
            throw new UnauthorizedException(
                `Error processing the request: ${error.message || 'Invalid request'}`,
            );
        }
    }
}
