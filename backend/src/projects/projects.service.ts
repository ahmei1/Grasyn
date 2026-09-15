import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma, ProjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AccessService, canManageMembers } from '../common/access.service';
import { EventsService } from '../common/events.service';
import { paginationMeta } from '../common/dto/pagination.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

const memberSelect = {
  user: { select: { id: true, name: true, email: true } },
} as const;

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
    private readonly events: EventsService,
  ) {}

  async create(userId: string, workspaceId: string, dto: CreateProjectDto) {
    await this.access.requireMembership(userId, workspaceId);
    this.validateDates(dto.startDate, dto.dueDate);
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          workspaceId,
          ownerId: userId,
          name: dto.name.trim(),
          description: dto.description?.trim() ?? '',
          priority: dto.priority,
          status: dto.status,
          archivedAt: dto.status === ProjectStatus.ARCHIVED ? new Date() : null,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          members: { create: { userId } },
        },
        include: { members: { include: memberSelect } },
      });
      await this.events.activity(
        {
          workspaceId,
          actorId: userId,
          projectId: project.id,
          type: 'project.created',
          metadata: { name: project.name },
        },
        tx,
      );
      return { project };
    });
  }

  async list(
    userId: string,
    workspaceId: string,
    query: { status?: string; q?: string; page?: number; pageSize?: number },
  ) {
    await this.access.requireMembership(userId, workspaceId);
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.ProjectWhereInput = {
      workspaceId,
      archivedAt: query.status === 'ARCHIVED' ? { not: null } : null,
      ...(query.status && query.status !== 'ARCHIVED'
        ? { status: query.status as ProjectStatus }
        : {}),
      ...(query.q ? { name: { contains: query.q, mode: 'insensitive' } } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        include: {
          members: { include: memberSelect },
          _count: { select: { tasks: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.project.count({ where }),
    ]);
    return { projects: items, meta: paginationMeta(total, page, pageSize) };
  }

  async getOne(userId: string, projectId: string) {
    const project = await this.access.requireProject(userId, projectId);
    const full = await this.prisma.project.findUnique({
      where: { id: project.id },
      include: {
        members: { include: memberSelect },
        _count: { select: { tasks: true } },
      },
    });
    return { project: full };
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto) {
    const project = await this.access.requireProject(userId, projectId);
    if (
      dto.status &&
      (dto.status === ProjectStatus.ARCHIVED || project.archivedAt)
    ) {
      await this.requireArchivePermission(userId, project);
    }
    this.validateDates(
      dto.startDate === undefined ? project.startDate : dto.startDate,
      dto.dueDate === undefined ? project.dueDate : dto.dueDate,
    );
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.project.update({
        where: { id: project.id },
        data: {
          ...(dto.name ? { name: dto.name.trim() } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description.trim() }
            : {}),
          ...(dto.priority ? { priority: dto.priority } : {}),
          ...(dto.status
            ? {
                status: dto.status,
                archivedAt:
                  dto.status === ProjectStatus.ARCHIVED
                    ? (project.archivedAt ?? new Date())
                    : null,
              }
            : {}),
          ...(dto.startDate !== undefined
            ? { startDate: dto.startDate ? new Date(dto.startDate) : null }
            : {}),
          ...(dto.dueDate !== undefined
            ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }
            : {}),
        },
        include: { members: { include: memberSelect } },
      });
      await this.events.activity(
        {
          workspaceId: project.workspaceId,
          actorId: userId,
          projectId: project.id,
          type: 'project.updated',
          metadata: { name: updated.name },
        },
        tx,
      );
      return { project: updated };
    });
  }

  async archive(userId: string, projectId: string) {
    const project = await this.access.requireProject(userId, projectId);
    await this.requireArchivePermission(userId, project);
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.project.update({
        where: { id: project.id },
        data: {
          archivedAt: new Date(),
          status: ProjectStatus.ARCHIVED,
        },
      });
      await this.events.activity(
        {
          workspaceId: project.workspaceId,
          actorId: userId,
          projectId: project.id,
          type: 'project.archived',
          metadata: { name: project.name },
        },
        tx,
      );
      return { project: updated };
    });
  }

  async addMember(userId: string, projectId: string, memberUserId: string) {
    const project = await this.access.requireProject(userId, projectId);
    await this.access.requireMembership(memberUserId, project.workspaceId);
    try {
      await this.prisma.projectMember.create({
        data: { projectId, userId: memberUserId },
      });
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== 'P2002'
      )
        throw error;
      throw new ConflictException({
        code: 'CONFLICT',
        message: 'Member already on this project',
      });
    }
    return this.getOne(userId, projectId);
  }

  async removeMember(userId: string, projectId: string, memberUserId: string) {
    const project = await this.access.requireProject(userId, projectId);
    await this.prisma.projectMember.deleteMany({
      where: { projectId: project.id, userId: memberUserId },
    });
    return this.getOne(userId, projectId);
  }
  private validateDates(
    start?: string | Date | null,
    due?: string | Date | null,
  ) {
    if (start && due && new Date(start) > new Date(due)) {
      throw new BadRequestException('Start date must be on or before due date');
    }
  }

  private async requireArchivePermission(
    userId: string,
    project: { workspaceId: string; ownerId: string },
  ) {
    const membership = await this.access.requireMembership(
      userId,
      project.workspaceId,
    );
    if (!canManageMembers(membership.role) && project.ownerId !== userId) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'You cannot archive or restore this project',
      });
    }
  }
}
