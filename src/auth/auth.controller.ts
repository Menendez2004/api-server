import { Body, Controller, Post, Res, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { AuthLocal } from './decorators/auth.local.decorator';
import { LoginRequestDto } from './dto/request/signIn.req';
import { Response } from 'express';
import { AuthRole } from './decorators/auth.roles.decorator';


@Controller('auth')
export class AuthController {
    constructor(
        private readonly auth: AuthService,
        private readonly userService: UsersService
    ) { }

    @Post('signin')
    @AuthLocal()
    async login(@Body() req: LoginRequestDto, @Res() res: Response){
        const user = await this.userService.findByEmail(req.email);
        const response = await this.auth.login(user);

        res.cookie('access_token',
            response.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development',
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 4,
        }).json(response);
        
    }

    @Post('/signout')
    @AuthRole('MANAGER', 'CLIENT')
    async logout(@Res() res: Response) {
        res.clearCookie('access_token').send('Logged out ✅️');
    }
}
