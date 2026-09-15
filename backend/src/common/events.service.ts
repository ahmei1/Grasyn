import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type ActivityInput = {
  workspaceId: string;
  actorId: string;
  type: string;
  projectId?: string;
  taskId?: string;
  metadata?: Prisma.InputJsonValue;
};

type NotifyInput = {
  workspaceId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  resourceType?: string;
  resourceId?: string;
};

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  activity(input: ActivityInput, db: Prisma.TransactionClient = this.prisma) {
    return db.activityEvent.create({
      data: {
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        type: input.type,
        projectId: input.projectId,
        taskId: input.taskId,
        metadata: input.metadata ?? {},
      },
    });
  }

  notify(input: NotifyInput, db: Prisma.TransactionClient = this.prisma) {
    if (!input.userId) return Promise.resolve(null);
    return db.notification.create({
      data: input,
    });
  }
}
