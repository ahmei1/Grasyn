import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessService } from '../common/access.service';
import { EventsService } from '../common/events.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
    private readonly events: EventsService,
  ) {}

  async list(userId: string, taskId: string) {
    const task = await this.access.requireTask(userId, taskId);
    const comments = await this.prisma.comment.findMany({
      where: { taskId: task.id },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return { comments };
  }

  async create(userId: string, taskId: string, dto: CreateCommentDto) {
    const task = await this.access.requireTask(userId, taskId);
    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          workspaceId: task.workspaceId,
          taskId: task.id,
          authorId: userId,
          body: dto.body.trim(),
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      });
      await this.events.activity(
        {
          workspaceId: task.workspaceId,
          actorId: userId,
          projectId: task.projectId,
          taskId: task.id,
          type: 'comment.created',
          metadata: { taskTitle: task.title },
        },
        tx,
      );
      if (task.assigneeId && task.assigneeId !== userId) {
        await this.events.notify(
          {
            workspaceId: task.workspaceId,
            userId: task.assigneeId,
            type: 'task.commented',
            title: 'New comment on a task',
            body: task.title,
            resourceType: 'task',
            resourceId: task.id,
          },
          tx,
        );
      }
      return { comment };
    });
  }
}
