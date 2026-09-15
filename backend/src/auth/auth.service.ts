import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function toUser(user: {
  id: string;
  email: string;
  name: string;
  timezone: string;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    timezone: user.timezone,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: 'An account with this email already exists',
      });
    }

    const passwordHash = await argon2.hash(dto.password);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: dto.name.trim(),
        },
      });
      const tokens = await this.issueTokens(user.id, tx);
      return { user: toUser(user), ...tokens };
    });
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Invalid email or password',
      });
    }
    const tokens = await this.issueTokens(user.id);
    return { user: toUser(user), ...tokens };
  }

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }
    return this.prisma.$transaction(async (tx) => {
      const stored = await tx.refreshToken.findUnique({
        where: { tokenHash: hashToken(refreshToken) },
        include: { user: true },
      });
      if (!stored || stored.expiresAt <= new Date()) {
        throw new UnauthorizedException('Not authenticated');
      }
      // Conditional deletion makes a token single-use even under concurrent refreshes.
      const consumed = await tx.refreshToken.deleteMany({
        where: { id: stored.id, expiresAt: { gt: new Date() } },
      });
      if (consumed.count !== 1) {
        throw new UnauthorizedException('Not authenticated');
      }
      const tokens = await this.issueTokens(stored.userId, tx);
      return { user: toUser(stored.user), ...tokens };
    });
  }

  async logout(refreshToken: string | undefined) {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      });
    }
    return toUser(user);
  }

  private async issueTokens(
    userId: string,
    db: Prisma.TransactionClient = this.prisma,
  ) {
    const accessToken = await this.jwt.signAsync({ sub: userId });
    const refreshToken = randomBytes(48).toString('hex');
    const days = Number(this.config.get('REFRESH_EXPIRES_DAYS') ?? 7);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await db.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt,
      },
    });
    return {
      accessToken,
      refreshToken,
      refreshMaxAgeMs: days * 24 * 60 * 60 * 1000,
    };
  }
}
