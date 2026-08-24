import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AccessService, canManageMembers } from '../common/access.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `${base || 'workspace'}-${randomBytes(3).toString('hex')}`;
}

const memberUser = {
  id: true,
  email: true,
  name: true,
  timezone: true,
} as const;

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AccessService,
  ) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.name.trim(),
        slug: slugify(dto.name),
        ownerId: userId,
        members: {
          create: { userId, role: WorkspaceRole.OWNER },
        },
      },
    });
    await this.prisma.auditEvent.create({
      data: {
        workspaceId: workspace.id,
        actorId: userId,
        action: 'workspace.created',
        metadata: { name: workspace.name },
      },
    });
    return { workspace };
  }

  async listForUser(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
      orderBy: { createdAt: 'asc' },
    });
    return {
      workspaces: memberships.map((m) => ({
        ...m.workspace,
        role: m.role,
      })),
    };
  }

  async getOne(userId: string, workspaceId: string) {
    const membership = await this.access.requireMembership(userId, workspaceId);
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Workspace not found',
      });
    }
    return { workspace: { ...workspace, role: membership.role } };
  }

  async listMembers(userId: string, workspaceId: string) {
    await this.access.requireMembership(userId, workspaceId);
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: { select: memberUser } },
      orderBy: { createdAt: 'asc' },
    });
    return {
      members: members.map((m) => ({
        id: m.id,
        role: m.role,
        createdAt: m.createdAt,
        user: m.user,
      })),
    };
  }

  async invite(userId: string, workspaceId: string, dto: InviteMemberDto) {
    const membership = await this.access.requireMembership(userId, workspaceId);
    if (!canManageMembers(membership.role)) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only owners and admins can invite members',
      });
    }
    const email = dto.email.toLowerCase().trim();
    const role = dto.role ?? WorkspaceRole.MEMBER;
    if (role === WorkspaceRole.OWNER) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Cannot invite someone as owner',
      });
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const already = await this.prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId, userId: existingUser.id },
        },
      });
      if (already) {
        throw new ConflictException({
          code: 'CONFLICT',
          message: 'This person is already a member',
        });
      }
    }

    const invite = await this.prisma.workspaceInvite.upsert({
      where: { workspaceId_email: { workspaceId, email } },
      create: {
        workspaceId,
        email,
        role,
        token: randomBytes(24).toString('hex'),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      update: {
        role,
        token: randomBytes(24).toString('hex'),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    await this.prisma.auditEvent.create({
      data: {
        workspaceId,
        actorId: userId,
        action: 'member.invited',
        metadata: { email, role },
      },
    });

    return { invite };
  }

  async getInvite(token: string) {
    const invite = await this.prisma.workspaceInvite.findUnique({
      where: { token },
      include: { workspace: { select: { id: true, name: true } } },
    });
    if (!invite || invite.expiresAt < new Date()) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Invite is invalid or expired',
      });
    }
    return {
      invite: {
        email: invite.email,
        role: invite.role,
        workspace: invite.workspace,
        expiresAt: invite.expiresAt,
      },
    };
  }

  async acceptInvite(userId: string, token: string) {
    const invite = await this.prisma.workspaceInvite.findUnique({
      where: { token },
    });
    if (!invite || invite.expiresAt < new Date()) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Invite is invalid or expired',
      });
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.email !== invite.email) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'This invite was sent to a different email address',
      });
    }

    await this.prisma.$transaction([
      this.prisma.workspaceMember.upsert({
        where: {
          workspaceId_userId: { workspaceId: invite.workspaceId, userId },
        },
        create: {
          workspaceId: invite.workspaceId,
          userId,
          role: invite.role,
        },
        update: {},
      }),
      this.prisma.workspaceInvite.delete({ where: { id: invite.id } }),
      this.prisma.auditEvent.create({
        data: {
          workspaceId: invite.workspaceId,
          actorId: userId,
          action: 'member.joined',
          metadata: { email: user.email, role: invite.role },
        },
      }),
    ]);

    return { workspaceId: invite.workspaceId };
  }

  async updateMemberRole(
    actorId: string,
    workspaceId: string,
    memberUserId: string,
    role: WorkspaceRole,
  ) {
    const actor = await this.access.requireMembership(actorId, workspaceId);
    if (!canManageMembers(actor.role)) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only owners and admins can change roles',
      });
    }
    if (role === WorkspaceRole.OWNER) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Use ownership transfer to make someone an owner',
      });
    }
    const target = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: memberUserId } },
    });
    if (!target) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Member not found',
      });
    }
    if (target.role === WorkspaceRole.OWNER) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Cannot change the owner role',
      });
    }
    const updated = await this.prisma.workspaceMember.update({
      where: { id: target.id },
      data: { role },
    });
    await this.prisma.auditEvent.create({
      data: {
        workspaceId,
        actorId,
        action: 'member.role_changed',
        metadata: { userId: memberUserId, role },
      },
    });
    return { member: updated };
  }

  async removeMember(actorId: string, workspaceId: string, memberUserId: string) {
    const actor = await this.access.requireMembership(actorId, workspaceId);
    if (actorId !== memberUserId && !canManageMembers(actor.role)) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only owners and admins can remove members',
      });
    }
    const target = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: memberUserId } },
    });
    if (!target) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Member not found',
      });
    }
    if (target.role === WorkspaceRole.OWNER) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Cannot remove the workspace owner',
      });
    }
    await this.prisma.workspaceMember.delete({ where: { id: target.id } });
    await this.prisma.auditEvent.create({
      data: {
        workspaceId,
        actorId,
        action: 'member.removed',
        metadata: { userId: memberUserId },
      },
    });
    return { ok: true };
  }
}
