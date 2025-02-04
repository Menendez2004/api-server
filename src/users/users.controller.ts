import {
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
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() req: SignUpReqDto): Promise<SignUpResDto> {
    return this.usersService.signUp(req);
  }

  @Throttle({ default: { ttl: 60, limit: 3 } })
  @Put('forget')
  @HttpCode(HttpStatus.ACCEPTED)
  async forgetPass(@Body() req: ForgetPassReqDto): Promise<string> {
    return this.usersService.forgetPass(req);
  }

  @Throttle({ default: { ttl: 60, limit: 3 } })
  @Get('reset-pass/:token')
  @Render('reset-pass-view')
  resetPassView(@Param('token') token: string, @Res() res: Response) {
    return this.usersService.renderResetPassView(token, res);
  }

  @Throttle({ default: { ttl: 60, limit: 3 } })
  @Put('reset-pass')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPass(@Body() req: ResetPassReqDto) {
    return this.usersService.resetPass(req);
  }
}
