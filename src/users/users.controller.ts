import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Render,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  SignUpReqDto,
  ForgetPassReqDto,
  ResetPassReqDto,
} from './dto/req/index.users.req';
import { SignUpResDto } from './dto/res/sigUp.res.dto';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { MailService } from 'src/helpers/mail/mail.service';
import { TokenService } from 'src/token/token.service';
import { ConfigurationService } from 'src/helpers/configuration/configuration.service';
import { Throttle } from '@nestjs/throttler';

@Controller('users')
export class UsersController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly configurationService: ConfigurationService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() req: SignUpReqDto): Promise<SignUpResDto> {
    const existingUser = await this.usersService.findByEmail(req.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    req.password = await this.usersService.hashPass(req.password);
    const user = await this.usersService.createUser(req);

    return {
      mail: user.email,
      username: user.userName,
    };
  }

  @Throttle({ default: { ttl: 60, limit: 3 } })
  @Put('forget')
  @HttpCode(HttpStatus.ACCEPTED)
  async forgetPass(@Body() req: ForgetPassReqDto): Promise<string> {
    const user = await this.usersService.findByEmail(req.email);
    if (!user) {
      throw new BadRequestException(` email ${req.email} not found`);
    }
    const token = randomUUID();
    const infoToken = {
      token,
      consumed: false,
      expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 4),
      user: { connect: { id: user.id } },
      tokenType: { connect: { id: 1 } },
    };
    const encodeToken = await this.tokenService.encodeToken(token);
    await Promise.all([
      this.tokenService.createToken(infoToken),
      this.mailService.sendMail({
        email: user.email,
        subject: 'Password Reset Request',
        uri: `http://localhost:8000/users/reset-password/${encodeToken}`,
        template: 'reset-pass',
        userName: `${user.userName}`,
      }),
    ]);
    console.log('Encoded Token:', encodeToken);
    console.log(
      'Full Reset URL:',
      `${this.configurationService.baseUrl}/users/reset-password/${encodeToken}`,
    );
    return `your token was sent to your email`;
  }

  @Throttle({ default: { ttl: 60, limit: 3 } })
  @Get('reset-password/:token')
  @Render('reset-view')
  resetPassView(@Param('token') token: string, @Res() res: Response) {
    const nonce = res.locals.nonce;
    res.cookie('token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 4 });
    return { nonce };
  }

  @Throttle({ default: { ttl: 60, limit: 3 } })
  @Put('reset-pass')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPass(@Body() req: ResetPassReqDto) {
    const [decodedToken, passwordHashed] = await Promise.all([
      this.tokenService.decodeToken(req.token),
      this.usersService.hashPass(req.password),
    ]);
    const resetPass = await this.usersService.resetPass(
      decodedToken,
      passwordHashed,
    );

    const tokenReset = await this.tokenService.findAuthToken(decodedToken);
    const user = await this.usersService.findById(tokenReset.userId);
    await this.mailService.sendMail({
      email: user.email,
      subject: 'reset password',
      message: 'password has been reset',
      userName: user.userName,
      template: 'reset-pass-confirmation',
    });
    if (!resetPass) {
      throw new BadRequestException(
        'looks like your token is invalid, please try again',
      );
    }
  }
}
