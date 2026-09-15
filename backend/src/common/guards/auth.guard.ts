import { ACCESS_COOKIE, readCookie } from '../cookies';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = readCookie(request.cookies, ACCESS_COOKIE);
    if (!token) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }

    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      if (typeof payload.sub !== 'string' || !payload.sub) {
        throw new Error('Invalid subject');
      }
    } catch {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }
    // Database failures should remain server errors, not masquerade as expired sessions.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, timezone: true },
    });
    if (!user) throw new UnauthorizedException('Not authenticated');
    (request as Request & { user: typeof user }).user = user;
    return true;
  }
}
