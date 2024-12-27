import { Body, Controller, Post, Res, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpExceptionFilter } from 'src/http.exception.filter';
import { UsersService } from 'src/users/users.service';
import { AuthLocal } from './decorators/auth.local.decorator';
import { LoginRequestDto } from './dto/request/signIn.req';
import { Response } from 'express';
import { Auth } from './decorators/auth.roles.decorator';


@Controller('auth')
@UseFilters(new HttpExceptionFilter())
export class AuthController {
    constructor(
        private readonly auth: AuthService,
        private readonly user: UsersService
    ) { }

    @Post('login')
    @AuthLocal()
    async login(@Body() req: LoginRequestDto, @Res() res: Response){
        const user = await this.user.findByEmail(req.email);
        const response = await this.auth.login(user);

        res.cookie('access_token', response.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' || 'development' ? true : false,
            sameSite: 'strict',
            maxAge: 4*60*60*1000,
        }).json(response);
        
    }

    @Post('/logout')
    @Auth('MANAGER', 'CLIENT')
    async logout(@Res() res: Response) {
        res.clearCookie('access_token').send('Logged out ✅️');
    }
}
