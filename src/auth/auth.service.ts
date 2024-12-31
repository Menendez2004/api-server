import { Injectable, InternalServerErrorException, UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import { LoginResponseDto } from './dto/response/signIn.dto';
import * as argon2 from 'argon2';
import { HttpExceptionFilter } from 'src/http.exception.filter';

Injectable()
@UseFilters(new HttpExceptionFilter())
export class AuthService {
    constructor(
        private service: UsersService,
        private jwt: JwtService
    ) { }

    async login(user: User): Promise<LoginResponseDto> {
        const userRole = await this.service.getUserRole(user.id);
        const payload = {
            sub: user.id,
            role: userRole.name,
        };
        return {
            accessToken: this.jwt.sign(payload),
        };
    }

    async verifyCredentials(
        email: string,
        password: string,
    ): Promise<User | null> {
        const user = await this.service.findByEmail(email);
        if (!user) {
            return null;
        }

        const isPasswordValid = await this.verifyCredentials(user.password, password);

        if (!isPasswordValid) {
            return null;
        }

        return user;
    }


    async verifyPass(
        hashedPassword: string,
        password: string,
    ): Promise<boolean> {
        try {
            return await argon2.verify(hashedPassword, password);
        } catch (err) {
            console.error('Error verifying password:', err);
            throw new InternalServerErrorException('Error verifying password, make sure that the password is correct');
        }
    }
}