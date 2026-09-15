import { Injectable } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AccessService } from '../common/access.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  async get(userId: string, workspaceId: string) {
    await this.access.requireMembership(userId, workspaceId);

    const [myTasks, recentProjects, recentActivity, counts] = await Promise.all(
      [
        this.prisma.task.findMany({
          where: {
            workspaceId,
            assigneeId: userId,
            status: { not: TaskStatus.DONE },
          },
          include: {
            project: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } },
          },
          orderBy: [{ dueDate: 'asc' }, { updatedAt: 'desc' }],
          take: 8,
        }),
        this.prisma.project.findMany({
          where: { workspaceId, archivedAt: null },
          include: { _count: { select: { tasks: true } } },
          orderBy: { updatedAt: 'desc' },
          take: 6,
        }),
        this.prisma.activityEvent.findMany({
          where: { workspaceId },
          include: {
            actor: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
            task: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 12,
        }),
        this.prisma.task.groupBy({
          by: ['status'],
          where: { workspaceId },
          _count: { _all: true },
        }),
      ],
    );

    return {
      myTasks,
      recentProjects,
      recentActivity,
      taskCounts: counts.reduce(
        (acc, row) => {
          acc[row.status] = row._count._all;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  }
}
