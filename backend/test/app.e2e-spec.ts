import { AuthService } from '../src/auth/auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { EventsService } from '../src/common/events.service';
import { TasksService } from '../src/tasks/tasks.service';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { setupApp } from '../src/setup-app';

describe('API integration (real PostgreSQL)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const emails = [
    `review-${randomUUID()}@example.com`,
    `review-${randomUUID()}@example.com`,
  ];
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    prisma = app.get(PrismaService);
    setupApp(app);
    await app.init();
  });
  afterAll(async () => {
    if (prisma) {
      // Only remove data owned by this run's randomly named test accounts.
      const users = await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { id: true },
      });
      const ids = users.map((user) => user.id);
      await prisma.workspace.deleteMany({ where: { ownerId: { in: ids } } });
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
    }
    await app?.close();
  });
  it('serves health and protects authenticated routes', async () => {
    await request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok', service: 'grasyn-api' });
    await request(app.getHttpServer()).get('/api/workspaces').expect(401);
  });
  it('runs workspace → project → task and rejects invalid input and other tenants', async () => {
    const owner = request.agent(app.getHttpServer());
    const outsider = request.agent(app.getHttpServer());
    await owner
      .post('/api/auth/register')
      .send({
        email: emails[0],
        password: 'TestPassword123!',
        name: 'Review Owner',
      })
      .expect(201);
    await outsider
      .post('/api/auth/register')
      .send({
        email: emails[1],
        password: 'TestPassword123!',
        name: 'Review Outsider',
      })
      .expect(201);
    const ws = await owner
      .post('/api/workspaces')
      .send({ name: 'Review Test' })
      .expect(201);
    const { workspace } = ws.body as { workspace: { id: string } };
    const created = await owner
      .post(`/api/workspaces/${workspace.id}/projects`)
      .send({ name: 'Project' })
      .expect(201);
    const { project } = created.body as { project: { id: string } };
    await owner
      .get(
        `/api/workspaces/${workspace.id}/projects?status=ACTIVE&page=1&pageSize=10`,
      )
      .expect(200);
    await owner
      .get(`/api/workspaces/${workspace.id}/projects?status=INVALID`)
      .expect(400);
    await owner
      .patch(`/api/projects/${project.id}`)
      .send({ description: null })
      .expect(400);
    await outsider.get(`/api/projects/${project.id}`).expect(403);
    const createdTask = await owner
      .post(`/api/projects/${project.id}/tasks`)
      .send({ title: 'Learn the request flow' })
      .expect(201);
    const { task } = createdTask.body as { task: { id: string } };
    await owner
      .get(`/api/projects/${project.id}/tasks?status=TODO&page=1&pageSize=10`)
      .expect(200);
    await owner
      .get(`/api/workspaces/${workspace.id}/tasks?status=TODO&page=1`)
      .expect(200);
    await owner
      .post(`/api/tasks/${task.id}/comments`)
      .send({ body: '  ' })
      .expect(400);
    await owner
      .post(`/api/tasks/${task.id}/comments`)
      .send({ body: 'Understood!' })
      .expect(201);
    await outsider.get(`/api/tasks/${task.id}/comments`).expect(403);
    const second = await owner
      .post(`/api/projects/${project.id}/tasks`)
      .send({ title: 'Second card' })
      .expect(201);
    const secondTask = (second.body as { task: { id: string } }).task;
    await owner
      .patch(`/api/tasks/${secondTask.id}/position`)
      .send({ status: 'TODO', position: 0 })
      .expect(200);
    let board = await prisma.task.findMany({
      where: { projectId: project.id, status: 'TODO' },
      orderBy: { position: 'asc' },
    });
    expect(board.map((card) => [card.id, card.position])).toEqual([
      [secondTask.id, 0],
      [task.id, 1],
    ]);
    await owner
      .patch(`/api/tasks/${secondTask.id}`)
      .send({ status: 'DONE' })
      .expect(200);
    board = await prisma.task.findMany({
      where: { projectId: project.id, status: 'TODO' },
    });
    expect(board[0].position).toBe(0);
    const account = await prisma.user.findUniqueOrThrow({
      where: { email: emails[0] },
    });
    const activityFailure = jest
      .spyOn(app.get(EventsService), 'activity')
      .mockImplementationOnce(() => {
        throw new Error('Simulated activity failure');
      });
    try {
      await expect(
        app
          .get(TasksService)
          .create(account.id, project.id, { title: 'Must roll back' }),
      ).rejects.toThrow('Simulated activity failure');
      expect(
        await prisma.task.count({
          where: { projectId: project.id, title: 'Must roll back' },
        }),
      ).toBe(0);
    } finally {
      activityFailure.mockRestore();
    }
    await owner
      .patch(`/api/tasks/${task.id}`)
      .send({ dueDate: null, assigneeId: null })
      .expect(200);
    await owner
      .patch(`/api/projects/${project.id}`)
      .send({ status: 'ARCHIVED' })
      .expect(200);
    const archived = await owner
      .get(`/api/workspaces/${workspace.id}/projects?status=ARCHIVED`)
      .expect(200);
    expect(
      (archived.body as { projects: { id: string }[] }).projects.map(
        (p) => p.id,
      ),
    ).toContain(project.id);
    const tokens = await app
      .get(PrismaService)
      .refreshToken.findMany({ where: { userId: account.id } });
    expect(tokens).toHaveLength(1);
    await owner.post('/api/auth/refresh').expect(201);
    await owner.get('/api/auth/me').expect(200);
    const invited = await owner
      .post(`/api/workspaces/${workspace.id}/invites`)
      .send({ email: emails[1] })
      .expect(201);
    const invite = (invited.body as { invite: { token: string } }).invite;
    await outsider.post(`/api/invites/${invite.token}/accept`).expect(201);
    await outsider
      .patch(`/api/projects/${project.id}`)
      .send({ status: 'ACTIVE' })
      .expect(403);
    const member = await prisma.user.findUniqueOrThrow({
      where: { email: emails[1] },
    });
    await owner
      .post(`/api/projects/${project.id}/members`)
      .send({ userId: member.id })
      .expect(201);
    await owner
      .patch(`/api/tasks/${task.id}`)
      .send({ assigneeId: member.id })
      .expect(200);
    expect(
      await prisma.notification.count({
        where: { userId: member.id, workspaceId: workspace.id },
      }),
    ).toBeGreaterThan(0);
    await owner
      .delete(`/api/workspaces/${workspace.id}/members/${member.id}`)
      .expect(200);
    expect(
      await prisma.projectMember.count({
        where: { projectId: project.id, userId: member.id },
      }),
    ).toBe(0);
    expect(
      (await prisma.task.findUniqueOrThrow({ where: { id: task.id } }))
        .assigneeId,
    ).toBeNull();
    await outsider.get(`/api/projects/${project.id}`).expect(403);
    await owner.post('/api/auth/logout').expect(201);
    await owner.get('/api/auth/me').expect(401);
    const auth = app.get(AuthService);
    const session = await auth.login(emails[0], 'TestPassword123!');
    const refreshes = await Promise.allSettled([
      auth.refresh(session.refreshToken),
      auth.refresh(session.refreshToken),
    ]);
    expect(
      refreshes.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    const rejected = refreshes.find((result) => result.status === 'rejected');
    expect(rejected?.reason).toBeInstanceOf(UnauthorizedException);
  });
  it('rejects browser mutations from untrusted origins', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Origin', 'https://untrusted.example')
      .send({ email: emails[0], password: 'TestPassword123!' })
      .expect(403);
  });
});
