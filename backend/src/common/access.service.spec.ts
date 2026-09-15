import { ForbiddenException } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { AccessService, canManageMembers } from './access.service';

describe('AccessService tenant isolation', () => {
  const prisma = {
    workspaceMember: { findUnique: jest.fn() },
    project: { findUnique: jest.fn() },
    task: { findUnique: jest.fn() },
  };
  const access = new AccessService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows members of the workspace', async () => {
    prisma.workspaceMember.findUnique.mockResolvedValue({
      role: WorkspaceRole.MEMBER,
    });
    await expect(
      access.requireMembership('user-a', 'workspace-a'),
    ).resolves.toEqual({ role: WorkspaceRole.MEMBER });
  });

  it('blocks users who are not members of the workspace', async () => {
    prisma.workspaceMember.findUnique.mockResolvedValue(null);
    await expect(
      access.requireMembership('user-b', 'workspace-a'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('does not allow a member of workspace B to read workspace A data', async () => {
    prisma.workspaceMember.findUnique.mockImplementation(
      ({
        where,
      }: {
        where: { workspaceId_userId: { workspaceId: string; userId: string } };
      }) => {
        if (
          where.workspaceId_userId.workspaceId === 'ws-b' &&
          where.workspaceId_userId.userId === 'user-b'
        ) {
          return Promise.resolve({ role: WorkspaceRole.MEMBER });
        }
        return Promise.resolve(null);
      },
    );

    await expect(
      access.requireMembership('user-b', 'ws-a'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      access.requireMembership('user-b', 'ws-b'),
    ).resolves.toBeTruthy();
  });
});

describe('RBAC helpers', () => {
  it('lets owners and admins manage members', () => {
    expect(canManageMembers(WorkspaceRole.OWNER)).toBe(true);
    expect(canManageMembers(WorkspaceRole.ADMIN)).toBe(true);
    expect(canManageMembers(WorkspaceRole.MEMBER)).toBe(false);
  });
});
