import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessService } from '../common/access.service';
import { paginationMeta } from '../common/dto/pagination.dto';

const actorSelect = { select: { id: true, name: true, email: true } } as const;

@Injectable()
export class ActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  async forWorkspace(
    userId: string,
    workspaceId: string,
    page = 1,
    pageSize = 20,
  ) {
    await this.access.requireMembership(userId, workspaceId);
    return this.list({ workspaceId }, page, pageSize);
  }

  async forProject(userId: string, projectId: string, page = 1, pageSize = 20) {
    const project = await this.access.requireProject(userId, projectId);
    return this.list({ projectId: project.id }, page, pageSize);
  }

  async forTask(userId: string, taskId: string, page = 1, pageSize = 20) {
    const task = await this.access.requireTask(userId, taskId);
    return this.list({ taskId: task.id }, page, pageSize);
  }

  private async list(
    where: { workspaceId?: string; projectId?: string; taskId?: string },
    page: number,
    pageSize: number,
  ) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.activityEvent.findMany({
        where,
        include: {
          actor: actorSelect,
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.activityEvent.count({ where }),
    ]);
    return { activity: items, meta: paginationMeta(total, page, pageSize) };
  }
}
