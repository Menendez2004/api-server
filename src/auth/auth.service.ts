import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import {LoginResponseDto } from './dto/signIn.dto';
import { LoginRequestDto } from './dto/request/signIn.req';
Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwt: JwtService
    ) { }

    async login(user: User): Promise<LoginResponseDto> {
        const userRole = await this.usersService.getUserRole(user.id);
        const payload = {
            sub: user.id,
            role: userRole.name,    
        };
        return {
            accessToken: this.jwt.sign(payload),
        };
    }

}