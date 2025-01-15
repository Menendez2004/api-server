import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UseFilters,
} from '@nestjs/common';
import { PrismaService } from '../helpers/prisma/prisma.service';
import { Prisma, Users, UserRoles } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../token/token.service';
import { GlobalExceptionFilter } from '../helpers/filters/global.exception.filter';

@Injectable()
@UseFilters(new GlobalExceptionFilter())
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) {}

  async createUser(data: Prisma.UsersCreateInput): Promise<Users> {
    try {
      const existingUser = await this.prismaService.users.findUnique({
        where: {
          email: data.email,
        },
      });
      if (existingUser) {
        throw new BadRequestException('This Email is already in use');
      }
      return await this.prismaService.users.create({ data });
    } catch {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async hashPass(password: string): Promise<string> {
    const saltRounds = 10;
    try {
      return await bcrypt.hash(password, saltRounds);
    } catch {
      throw new InternalServerErrorException(
        'An error occurred while hashing the password. Please try again later.',
      );
    }
  }

  async findById(id: string): Promise<Users> {
    try {
      const user = await this.prismaService.users.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`imposible to find  a user with id: ${id}`);
      }
      return user;
    } catch (err) {
      throw new NotFoundException(
        `Error finding user by ID ${id}: ${err.message}`,
      );
    }
  }

  async findByEmail(email: string): Promise<Users | null> {
    try {
      return await this.prismaService.users.findUnique({
        where: { email },
      });
    } catch (err) {
      throw new NotFoundException(
        `Error finding user by email ${email}: ${err.message}`,
      );
    }
  }

  async getUserRole(userId: string): Promise<UserRoles | null> {
    const user = await this.findById(userId);
    const userRole = await this.prismaService.userRoles.findUnique({
      where: {
        id: user.roleId,
      },
    });
    if (!userRole) {
      throw new NotFoundException(`User role not found for user ID ${userId}`);
    }

    return userRole;
  }

  async resetPass(
    verificationToken: string,
    newHashedPas: string,
  ): Promise<boolean> {
    try {
      const token = await this.tokenService.findAuthToken(verificationToken);

      await this.prismaService.users.update({
        where: { id: token.userId },
        data: { password: newHashedPas },
      });
      this.logger.log(`Password reset for user ID ${token.userId}`);

      await this.consumedToken(token.id);
      return true;
    } catch (err) {
      this.logger.error(`Error resetting password: ${err.message}`);
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  private async consumedToken(tokenId: string): Promise<void> {
    await this.prismaService.verificationTokens.update({
      where: { id: tokenId },
      data: { consumed: true },
    });
  }
}
