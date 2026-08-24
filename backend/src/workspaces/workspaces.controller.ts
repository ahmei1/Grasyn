import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('workspaces')
@Controller()
export class WorkspacesController {
  constructor(private readonly workspaces: WorkspacesService) {}

  @Post('workspaces')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateWorkspaceDto) {
    return this.workspaces.create(user.id, dto);
  }

  @Get('workspaces')
  list(@CurrentUser() user: AuthUser) {
    return this.workspaces.listForUser(user.id);
  }

  @Get('workspaces/:workspaceId')
  getOne(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.workspaces.getOne(user.id, workspaceId);
  }

  @Get('workspaces/:workspaceId/members')
  members(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.workspaces.listMembers(user.id, workspaceId);
  }

  @Post('workspaces/:workspaceId/invites')
  invite(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.workspaces.invite(user.id, workspaceId, dto);
  }

  @Public()
  @Get('invites/:token')
  getInvite(@Param('token') token: string) {
    return this.workspaces.getInvite(token);
  }

  @Post('invites/:token/accept')
  accept(@CurrentUser() user: AuthUser, @Param('token') token: string) {
    return this.workspaces.acceptInvite(user.id, token);
  }

  @Patch('workspaces/:workspaceId/members/:memberUserId')
  updateRole(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('memberUserId') memberUserId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.workspaces.updateMemberRole(
      user.id,
      workspaceId,
      memberUserId,
      dto.role,
    );
  }

  @Delete('workspaces/:workspaceId/members/:memberUserId')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Param('memberUserId') memberUserId: string,
  ) {
    return this.workspaces.removeMember(user.id, workspaceId, memberUserId);
  }
}
