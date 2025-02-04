import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Prisma, Users, UserRoles } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../token/token.service';
import { MailService } from '../common/mail/mail.service';
import {
  SignUpReqDto,
  ForgetPassReqDto,
  ResetPassReqDto,
} from './dto/req/index.users.req';
import { SignUpResDto } from './dto/res/sigUp.res.dto';
import { randomUUID } from 'crypto';
import { Response } from 'express';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async signUp(req: SignUpReqDto): Promise<SignUpResDto> {
    const existingUser = await this.prismaService.users.findUnique({
      where: { email: req.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    req.password = await this.hashPass(req.password);
    const user = await this.prismaService.users.create({ data: req });

    return { mail: user.email, username: user.userName };
  }

  /**
   * Initiates password reset process
   */
  async forgetPass(req: ForgetPassReqDto): Promise<string> {
    const user = await this.prismaService.users.findUnique({
      where: { email: req.email },
    });

    if (!user) {
      throw new BadRequestException(`Email ${req.email} not found`);
    }

    const token = randomUUID();
    const encodedToken = await this.tokenService.encodeToken(token);

    await this.prismaService.verificationTokens.create({
      data: {
        token,
        consumed: false,
        expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4 hours expiry
        userId: user.id,
        tokenTypeId: 1,
      },
    });

    await this.mailService.sendMail({
      email: user.email,
      subject: 'Password Reset Request',
      uri: `${process.env.BASE_URL}/api/v1/users/reset-pass/${encodedToken}`,
      template: './reset-pass',
      userName: user.userName,
    });

    return `Your token was sent to your email.`;
  }

  /**
   * Renders the reset password view and stores token in cookies
   */
  renderResetPassView(token: string, res: Response) {
    const nonce = res.locals.nonce || 'default-nonce';
    res.cookie('token', token, { httpOnly: false, maxAge: 900_000 }); // 15 minutes
    return { nonce };
  }

  async resetPass(req: ResetPassReqDto): Promise<void> {
    const [decodedToken, passwordHashed] = await Promise.all([
      this.tokenService.decodeToken(req.token),
      this.hashPass(req.new_password),
    ]);

    const tokenRecord = await this.tokenService.findAuthToken(decodedToken);
    if (!tokenRecord || !this.isValidToken(tokenRecord, 1)) {
      throw new BadRequestException('Invalid token, please try again');
    }

    await this.prismaService.users.update({
      where: { id: tokenRecord.userId },
      data: { password: passwordHashed },
    });

    await this.consumeToken(tokenRecord.id);

    const user = await this.prismaService.users.findUnique({
      where: { id: tokenRecord.userId },
    });

    await this.mailService.sendMail({
      email: user.email,
      subject: 'Reset Password',
      message: 'Your password has been successfully reset.',
      userName: user.userName,
      template: './reset-pass-confirmation',
    });
  }

  async createUser(data: Prisma.UsersCreateInput): Promise<Users> {
    try {
      const existingUser = await this.prismaService.users.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new BadRequestException('This Email is already in use');
      }

      return await this.prismaService.users.create({ data });
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findById(id: string): Promise<Users> {
    try {
      const user = await this.prismaService.users.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      throw new NotFoundException(
        `Error finding user by ID ${id}: ${error.message}`,
      );
    }
  }

  async findByEmail(email: string): Promise<Users | null> {
    try {
      return await this.prismaService.users.findUnique({ where: { email } });
    } catch (error) {
      throw new NotFoundException(
        `Error finding user by email ${email}: ${error.message}`,
      );
    }
  }

  async getUserRole(userId: string): Promise<UserRoles | null> {
    try {
      const user = await this.findById(userId);
      const userRole = await this.prismaService.userRoles.findUnique({
        where: {
          id: user.roleId,
        },
      });

      if (!userRole) {
        throw new NotFoundException(
          `User role not found for user ID ${userId}`,
        );
      }

      return userRole;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching user role: ${error.message}`,
      );
    }
  }

  async hashPass(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 10);
    } catch (error) {
      this.logger.error(`Error hashing password: ${error.message}`);
      throw new InternalServerErrorException('Error hashing the password.');
    }
  }

  private async consumeToken(tokenId: string): Promise<void> {
    await this.prismaService.verificationTokens.update({
      where: { id: tokenId },
      data: { consumed: true },
    });
  }

  private isValidToken(token: any, expectedTypeId: number): boolean {
    return !!(
      token &&
      token.tokenTypeId === expectedTypeId &&
      !token.consumed &&
      new Date() <= new Date(token.expiredAt)
    );
  }
}
