import { PrismaClient, ProjectPriority, ProjectStatus, TaskPriority, TaskStatus, WorkspaceRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  await prisma.notification.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.activityEvent.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceInvite.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await argon2.hash('Demo1234!');

  const alex = await prisma.user.create({
    data: {
      email: 'alex@grasyn.dev',
      name: 'Alex Rivera',
      timezone: 'America/New_York',
      passwordHash,
    },
  });
  const jordan = await prisma.user.create({
    data: {
      email: 'jordan@grasyn.dev',
      name: 'Jordan Chen',
      timezone: 'Europe/Berlin',
      passwordHash,
    },
  });
  const sam = await prisma.user.create({
    data: {
      email: 'sam@grasyn.dev',
      name: 'Sam Okonkwo',
      timezone: 'Africa/Lagos',
      passwordHash,
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Lumen Labs',
      slug: 'lumen-labs',
      ownerId: alex.id,
      members: {
        create: [
          { userId: alex.id, role: WorkspaceRole.OWNER },
          { userId: jordan.id, role: WorkspaceRole.ADMIN },
          { userId: sam.id, role: WorkspaceRole.MEMBER },
        ],
      },
    },
  });

  const platform = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      ownerId: alex.id,
      name: 'Grasyn Platform',
      description: 'Core workspace, auth, and project workflows.',
      status: ProjectStatus.ACTIVE,
      priority: ProjectPriority.HIGH,
      members: {
        create: [{ userId: alex.id }, { userId: jordan.id }, { userId: sam.id }],
      },
    },
  });

  const design = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      ownerId: jordan.id,
      name: 'Design System',
      description: 'Shared UI primitives and product chrome.',
      status: ProjectStatus.ACTIVE,
      priority: ProjectPriority.MEDIUM,
      members: {
        create: [{ userId: jordan.id }, { userId: alex.id }],
      },
    },
  });

  const authTask = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId: platform.id,
      title: 'Ship cookie-based authentication',
      description: 'httpOnly access + refresh cookies, argon2 hashes, session restore.',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      assigneeId: alex.id,
      creatorId: alex.id,
      position: 0,
    },
  });
  const kanbanTask = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId: platform.id,
      title: 'Build the project Kanban board',
      description: 'Drag tasks between To do, In progress, In review, and Done.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigneeId: jordan.id,
      creatorId: alex.id,
      position: 0,
    },
  });
  const inviteTask = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId: platform.id,
      title: 'Invite the rest of the squad',
      description: 'Workspace invites with role-aware permissions.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigneeId: sam.id,
      creatorId: alex.id,
      position: 0,
    },
  });
  await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId: platform.id,
      title: 'Write the workspace catch-up notes',
      description: 'Keep a human summary of what shipped this week until AI catch-up exists.',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      assigneeId: alex.id,
      creatorId: alex.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      position: 1,
    },
  });
  await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId: design.id,
      title: 'Document graphite + teal tokens',
      description: 'Keep the product identity consistent across empty, loading, and error states.',
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.LOW,
      assigneeId: jordan.id,
      creatorId: jordan.id,
      position: 0,
    },
  });

  await prisma.comment.create({
    data: {
      workspaceId: workspace.id,
      taskId: kanbanTask.id,
      authorId: alex.id,
      body: 'Let us keep the columns aligned with the backend TaskStatus enum so we do not invent a second workflow.',
    },
  });
  await prisma.comment.create({
    data: {
      workspaceId: workspace.id,
      taskId: kanbanTask.id,
      authorId: jordan.id,
      body: 'Agreed. I will wire drag-and-drop to PATCH /tasks/:id/position.',
    },
  });

  await prisma.activityEvent.createMany({
    data: [
      {
        workspaceId: workspace.id,
        actorId: alex.id,
        projectId: platform.id,
        type: 'project.created',
        metadata: { name: platform.name },
      },
      {
        workspaceId: workspace.id,
        actorId: alex.id,
        projectId: platform.id,
        taskId: authTask.id,
        type: 'task.created',
        metadata: { title: authTask.title },
      },
      {
        workspaceId: workspace.id,
        actorId: jordan.id,
        projectId: platform.id,
        taskId: kanbanTask.id,
        type: 'task.updated',
        metadata: { title: kanbanTask.title, status: TaskStatus.IN_PROGRESS },
      },
    ],
  });

  await prisma.notification.create({
    data: {
      workspaceId: workspace.id,
      userId: jordan.id,
      type: 'task.assigned',
      title: 'Task assigned to you',
      body: kanbanTask.title,
      resourceType: 'task',
      resourceId: kanbanTask.id,
    },
  });
  await prisma.notification.create({
    data: {
      workspaceId: workspace.id,
      userId: sam.id,
      type: 'task.assigned',
      title: 'Task assigned to you',
      body: inviteTask.title,
      resourceType: 'task',
      resourceId: inviteTask.id,
    },
  });

  await prisma.auditEvent.create({
    data: {
      workspaceId: workspace.id,
      actorId: alex.id,
      action: 'workspace.created',
      metadata: { name: workspace.name },
    },
  });

  console.log('Seeded Grasyn demo workspace.');
  console.log('  alex@grasyn.dev / Demo1234!');
  console.log('  jordan@grasyn.dev / Demo1234!');
  console.log('  sam@grasyn.dev / Demo1234!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
