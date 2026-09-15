import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('activity')
@Controller()
export class ActivityController {
  constructor(private readonly activity: ActivityService) {}

  @Get('workspaces/:workspaceId/activity')
  workspace(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Query() page: PaginationQueryDto,
  ) {
    return this.activity.forWorkspace(
      user.id,
      workspaceId,
      page.page,
      page.pageSize,
    );
  }

  @Get('projects/:projectId/activity')
  project(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Query() page: PaginationQueryDto,
  ) {
    return this.activity.forProject(
      user.id,
      projectId,
      page.page,
      page.pageSize,
    );
  }

  @Get('tasks/:taskId/activity')
  task(
    @CurrentUser() user: AuthUser,
    @Param('taskId') taskId: string,
    @Query() page: PaginationQueryDto,
  ) {
    return this.activity.forTask(user.id, taskId, page.page, page.pageSize);
  }
}
