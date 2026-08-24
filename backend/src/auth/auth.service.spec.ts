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
    prisma.user.create.mockImplementation(async ({ data }) => ({
      id: 'user_1',
      email: data.email,
      name: data.name,
      timezone: 'UTC',
      passwordHash: data.passwordHash,
    }));
    prisma.refreshToken.create.mockResolvedValue({});

    const result = await service.register({
      email: 'Alex@Grasyn.dev',
      password: 'Demo1234!',
      name: 'Alex',
    });

    expect(result.user.email).toBe('alex@grasyn.dev');
    expect(prisma.user.create).toHaveBeenCalled();
    const hash = prisma.user.create.mock.calls[0][0].data.passwordHash;
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
    await expect(service.login('nobody@grasyn.dev', 'x')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
