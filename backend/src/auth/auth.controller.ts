import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  cookieOptions,
} from '../common/cookies';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.register(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken, result.refreshMaxAgeMs);
    return { user: result.user };
  }

  @Public()
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto.email, dto.password);
    this.setAuthCookies(res, result.accessToken, result.refreshToken, result.refreshMaxAgeMs);
    return { user: result.user };
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.refresh(req.cookies?.[REFRESH_COOKIE]);
    this.setAuthCookies(res, result.accessToken, result.refreshToken, result.refreshMaxAgeMs);
    return { user: result.user };
  }

  @Public()
  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(req.cookies?.[REFRESH_COOKIE]);
    res.clearCookie(ACCESS_COOKIE, { path: '/' });
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    return { ok: true };
  }

  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    return { user: await this.auth.me(user.id) };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    refreshMaxAgeMs: number,
  ) {
    const secure = this.config.get('COOKIE_SECURE') === 'true';
    res.cookie(ACCESS_COOKIE, accessToken, cookieOptions(15 * 60 * 1000, secure));
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(refreshMaxAgeMs, secure));
  }
}
