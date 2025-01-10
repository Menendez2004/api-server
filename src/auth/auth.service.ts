import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Users } from '@prisma/client';
import { LoginResponseDto } from './dto/response/signIn.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: Users): Promise<LoginResponseDto> {
    const userRole = await this.userService.getUserRole(user.id);
    const payload = {
      sub: user.id,
      role: userRole.name,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async verifyCredentials(
    email: string,
    password: string,
  ): Promise<Users | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.verifyPass(user.password, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async verifyPass(hashedPassword: string, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch {
      throw new InternalServerErrorException(
        'Error verifying password, make sure that the password is correct',
      );
    }
  }
}
