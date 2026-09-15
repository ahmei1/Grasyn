import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = {
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  const jwt = { signAsync: jest.fn().mockResolvedValue('access.jwt') };
  const config = { get: jest.fn().mockReturnValue(7) };

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(
      (callback: (tx: unknown) => unknown) => callback(prisma),
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('registers a new user and hashes the password', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(
      ({
        data,
      }: {
        data: { email: string; name: string; passwordHash: string };
      }) =>
        Promise.resolve({
          id: 'user_1',
          email: data.email,
          name: data.name,
          timezone: 'UTC',
          passwordHash: data.passwordHash,
        }),
    );
    prisma.refreshToken.create.mockResolvedValue({});

    const result = await service.register({
      email: 'Alex@Grasyn.dev',
      password: 'Demo1234!',
      name: 'Alex',
    });

    expect(result.user.email).toBe('alex@grasyn.dev');
    expect(prisma.user.create).toHaveBeenCalled();
    const input = (prisma.user.create.mock.calls as unknown[][])[0][0] as {
      data: { passwordHash: string };
    };
    const hash = input.data.passwordHash;
    expect(hash).not.toBe('Demo1234!');
    await expect(argon2.verify(hash, 'Demo1234!')).resolves.toBe(true);
    expect(result.accessToken).toBe('access.jwt');
    expect(result.refreshToken).toHaveLength(96);
  });

  it('rejects duplicate emails', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'existing' });
    await expect(
      service.register({
        email: 'alex@grasyn.dev',
        password: 'Demo1234!',
        name: 'Alex',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects invalid login credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.login('nobody@grasyn.dev', 'x'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('rotates refresh tokens through a transaction', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'r',
      userId: 'u',
      expiresAt: new Date(Date.now() + 60000),
      user: { id: 'u', email: 'a@example.com', name: 'A', timezone: 'UTC' },
    });
    prisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });
    const result = await service.refresh('old-token');
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result.refreshToken).not.toBe('old-token');
    expect(prisma.refreshToken.create).toHaveBeenCalled();
  });

  it('rejects a token already consumed by a competing refresh', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'r',
      expiresAt: new Date(Date.now() + 60000),
    });
    prisma.refreshToken.deleteMany.mockResolvedValue({ count: 0 });
    await expect(service.refresh('old-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(prisma.refreshToken.create).not.toHaveBeenCalled();
  });

  it('rejects expired refresh tokens without issuing a replacement', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      expiresAt: new Date(0),
    });
    await expect(service.refresh('expired')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(prisma.refreshToken.create).not.toHaveBeenCalled();
  });
});
