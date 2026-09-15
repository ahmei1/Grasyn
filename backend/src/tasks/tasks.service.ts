import { Injectable } from '@nestjs/common';
import { Prisma, TaskPriority, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AccessService } from '../common/access.service';
import { EventsService } from '../common/events.service';
import { paginationMeta } from '../common/dto/pagination.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true } },
  creator: { select: { id: true, name: true, email: true } },
  project: { select: { id: true, name: true } },
  _count: { select: { comments: true } },
} as const;

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
    private readonly events: EventsService,
  ) {}

  async create(userId: string, projectId: string, dto: CreateTaskDto) {
    const project = await this.access.requireProject(userId, projectId);
    if (dto.assigneeId) {
      await this.access.requireMembership(dto.assigneeId, project.workspaceId);
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "Project" WHERE "id" = ${projectId} FOR UPDATE`;
      const last = await tx.task.findFirst({
        where: { projectId, status: dto.status ?? TaskStatus.TODO },
        orderBy: { position: 'desc' },
      });
      const task = await tx.task.create({
        data: {
          workspaceId: project.workspaceId,
          projectId,
          title: dto.title.trim(),
          description: dto.description?.trim() ?? '',
          status: dto.status ?? TaskStatus.TODO,
          priority: dto.priority ?? TaskPriority.MEDIUM,
          assigneeId: dto.assigneeId || null,
          creatorId: userId,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          position: (last?.position ?? -1) + 1,
        },
        include: taskInclude,
      });
      await this.events.activity(
        {
          workspaceId: project.workspaceId,
          actorId: userId,
          projectId,
          taskId: task.id,
          type: 'task.created',
          metadata: { title: task.title },
        },
        tx,
      );
      if (task.assigneeId && task.assigneeId !== userId) {
        await this.events.notify(
          {
            workspaceId: project.workspaceId,
            userId: task.assigneeId,
            type: 'task.assigned',
            title: 'Task assigned to you',
            body: task.title,
            resourceType: 'task',
            resourceId: task.id,
          },
          tx,
        );
      }
      return { task };
    });
  }

  async listForProject(
    userId: string,
    projectId: string,
    query: {
      status?: TaskStatus;
      priority?: TaskPriority;
      assignee?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const project = await this.access.requireProject(userId, projectId);
    return this.queryTasks(userId, project.workspaceId, {
      ...query,
      projectId,
    });
  }

  async listForWorkspace(
    userId: string,
    workspaceId: string,
    query: {
      status?: TaskStatus;
      priority?: TaskPriority;
      assignee?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    await this.access.requireMembership(userId, workspaceId);
    return this.queryTasks(userId, workspaceId, query);
  }

  async getOne(userId: string, taskId: string) {
    const existing = await this.access.requireTask(userId, taskId);
    const task = await this.prisma.task.findUnique({
      where: { id: existing.id },
      include: taskInclude,
    });
    return { task };
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    const existing = await this.access.requireTask(userId, taskId);
    if (dto.assigneeId) {
      await this.access.requireMembership(dto.assigneeId, existing.workspaceId);
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "Project" WHERE "id" = ${existing.projectId} FOR UPDATE`;
      const current = await tx.task.findUniqueOrThrow({
        where: { id: taskId },
      });
      const previousAssignee = current.assigneeId;
      let position = current.position;
      if (dto.status && dto.status !== current.status) {
        position = await this.reposition(tx, current, dto.status);
      }
      const task = await tx.task.update({
        where: { id: existing.id },
        data: {
          position,
          ...(dto.title ? { title: dto.title.trim() } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description.trim() }
            : {}),
          ...(dto.status ? { status: dto.status } : {}),
          ...(dto.priority ? { priority: dto.priority } : {}),
          ...(dto.assigneeId !== undefined
            ? { assigneeId: dto.assigneeId || null }
            : {}),
          ...(dto.dueDate !== undefined
            ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }
            : {}),
        },
        include: taskInclude,
      });
      await this.events.activity(
        {
          workspaceId: existing.workspaceId,
          actorId: userId,
          projectId: existing.projectId,
          taskId: existing.id,
          type: 'task.updated',
          metadata: {
            title: task.title,
            status: task.status,
            assigneeId: task.assigneeId,
          },
        },
        tx,
      );
      if (
        task.assigneeId &&
        task.assigneeId !== userId &&
        task.assigneeId !== previousAssignee
      ) {
        await this.events.notify(
          {
            workspaceId: existing.workspaceId,
            userId: task.assigneeId,
            type: 'task.assigned',
            title: 'Task assigned to you',
            body: task.title,
            resourceType: 'task',
            resourceId: task.id,
          },
          tx,
        );
      }
      return { task };
    });
  }

  async move(userId: string, taskId: string, dto: MoveTaskDto) {
    const existing = await this.access.requireTask(userId, taskId);
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "Project" WHERE "id" = ${existing.projectId} FOR UPDATE`;
      const current = await tx.task.findUniqueOrThrow({
        where: { id: taskId },
      });
      const position = await this.reposition(
        tx,
        current,
        dto.status,
        dto.position,
      );
      const task = await tx.task.update({
        where: { id: existing.id },
        data: { status: dto.status, position },
        include: taskInclude,
      });
      await this.events.activity(
        {
          workspaceId: existing.workspaceId,
          actorId: userId,
          projectId: existing.projectId,
          taskId: existing.id,
          type: 'task.moved',
          metadata: { title: task.title, status: dto.status },
        },
        tx,
      );
      return { task };
    });
  }

  // Caller holds the project row lock. Re-number siblings so inserts never tie.
  private async reposition(
    tx: Prisma.TransactionClient,
    current: { id: string; projectId: string; status: TaskStatus },
    status: TaskStatus,
    requested?: number,
  ) {
    const siblings = await tx.task.findMany({
      where: { projectId: current.projectId, status, id: { not: current.id } },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
      select: { id: true },
    });
    const position = Math.min(requested ?? siblings.length, siblings.length);
    for (const [index, sibling] of siblings.entries()) {
      await tx.task.update({
        where: { id: sibling.id },
        data: { position: index < position ? index : index + 1 },
      });
    }
    if (current.status !== status) {
      const previous = await tx.task.findMany({
        where: {
          projectId: current.projectId,
          status: current.status,
          id: { not: current.id },
        },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
        select: { id: true },
      });
      for (const [index, sibling] of previous.entries()) {
        await tx.task.update({
          where: { id: sibling.id },
          data: { position: index },
        });
      }
    }
    return position;
  }

  private async queryTasks(
    userId: string,
    workspaceId: string,
    query: {
      projectId?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assignee?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const where: Prisma.TaskWhereInput = {
      workspaceId,
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.assignee === 'me' ? { assigneeId: userId } : {}),
      ...(query.assignee && query.assignee !== 'me'
        ? { assigneeId: query.assignee }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy: [
          { status: 'asc' },
          { position: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.task.count({ where }),
    ]);
    return { tasks: items, meta: paginationMeta(total, page, pageSize) };
  }
}
