import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('projects')
@Controller()
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post('workspaces/:workspaceId/projects')
  create(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projects.create(user.id, workspaceId, dto);
  }

  @Get('workspaces/:workspaceId/projects')
  list(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Query() query: ProjectQueryDto,
  ) {
    return this.projects.list(user.id, workspaceId, query);
  }

  @Get('projects/:projectId')
  getOne(@CurrentUser() user: AuthUser, @Param('projectId') projectId: string) {
    return this.projects.getOne(user.id, projectId);
  }

  @Patch('projects/:projectId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projects.update(user.id, projectId, dto);
  }

  @Post('projects/:projectId/archive')
  archive(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
  ) {
    return this.projects.archive(user.id, projectId);
  }

  @Post('projects/:projectId/members')
  addMember(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Body() dto: AddProjectMemberDto,
  ) {
    return this.projects.addMember(user.id, projectId, dto.userId);
  }

  @Delete('projects/:projectId/members/:memberUserId')
  removeMember(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Param('memberUserId') memberUserId: string,
  ) {
    return this.projects.removeMember(user.id, projectId, memberUserId);
  }
}
