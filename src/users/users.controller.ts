import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { SignUpReqDto } from './dto/req/sigUp.reqDto';
import { SignUpResDto } from './dto/res/sigUp.resDto';
import { randomUUID } from 'crypto';


@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    async signUp(@Body() req: SignUpReqDto): Promise<SignUpResDto> {
        const existingData = await this.usersService.findByEmail(req.email);
        if (existingData) {
            throw new BadRequestException('Email already exists');
        }

        req.password = await this.usersService.hashPass(req.password);
        const userPayload = { ...req}

        const user = await this.usersService.createUser(userPayload);
        const token = randomUUID();

        const [userRes] = await Promise.all([
            user
        ]);

        return {
            mail: req.email,
            username: req.userName
        }
    }
}
