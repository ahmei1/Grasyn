import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ProjectStatus, WorkspaceRole } from '@prisma/client';
import { ProjectsService } from './projects.service';

describe('Project archive invariants', () => {
  const prisma = {
    $transaction: jest.fn(),
    project: { update: jest.fn(), create: jest.fn() },
  };
  const access = { requireProject: jest.fn(), requireMembership: jest.fn() };
  const events = { activity: jest.fn() };
  const service = new ProjectsService(
    prisma as never,
    access as never,
    events as never,
  );
  beforeEach(() => {
    jest.resetAllMocks();
    prisma.$transaction.mockImplementation(
      (callback: (tx: unknown) => unknown) => callback(prisma),
    );
    access.requireProject.mockResolvedValue({
      id: 'p',
      workspaceId: 'w',
      ownerId: 'owner',
      archivedAt: null,
    });
    access.requireMembership.mockResolvedValue({ role: WorkspaceRole.MEMBER });
    prisma.project.update.mockResolvedValue({ id: 'p', name: 'Project' });
  });
  it('prevents members from bypassing archive permissions through PATCH', async () => {
    await expect(
      service.update('member', 'p', { status: ProjectStatus.ARCHIVED }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.project.update).not.toHaveBeenCalled();
  });
  it('sets archivedAt when an owner archives through PATCH', async () => {
    await service.update('owner', 'p', { status: ProjectStatus.ARCHIVED });
    const input = (prisma.project.update.mock.calls as unknown[][])[0][0] as {
      data: { archivedAt: unknown };
    };
    expect(input.data.archivedAt).toBeInstanceOf(Date);
  });
  it('clears archivedAt when restoring a project', async () => {
    access.requireProject.mockResolvedValue({
      id: 'p',
      workspaceId: 'w',
      ownerId: 'owner',
      archivedAt: new Date(),
    });
    await service.update('owner', 'p', { status: ProjectStatus.ACTIVE });
    const input = (prisma.project.update.mock.calls as unknown[][])[0][0] as {
      data: { archivedAt: unknown };
    };
    expect(input.data.archivedAt).toBeNull();
  });
  it('compares a changed date with the existing other date', async () => {
    access.requireProject.mockResolvedValue({
      id: 'p',
      startDate: new Date('2026-09-08'),
    });
    await expect(
      service.update('owner', 'p', { dueDate: '2026-09-01' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
