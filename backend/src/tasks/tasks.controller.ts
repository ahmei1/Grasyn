import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('tasks')
@Controller()
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post('projects/:projectId/tasks')
  create(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasks.create(user.id, projectId, dto);
  }

  @Get('projects/:projectId/tasks')
  listProject(
    @CurrentUser() user: AuthUser,
    @Param('projectId') projectId: string,
    @Query() query: TaskQueryDto,
    @Query() page: PaginationQueryDto,
  ) {
    return this.tasks.listForProject(user.id, projectId, { ...query, ...page });
  }

  @Get('workspaces/:workspaceId/tasks')
  listWorkspace(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Query() query: TaskQueryDto,
    @Query() page: PaginationQueryDto,
  ) {
    return this.tasks.listForWorkspace(user.id, workspaceId, {
      ...query,
      ...page,
    });
  }

  @Get('tasks/:taskId')
  getOne(@CurrentUser() user: AuthUser, @Param('taskId') taskId: string) {
    return this.tasks.getOne(user.id, taskId);
  }

  @Patch('tasks/:taskId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(user.id, taskId, dto);
  }

  @Patch('tasks/:taskId/position')
  move(
    @CurrentUser() user: AuthUser,
    @Param('taskId') taskId: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasks.move(user.id, taskId, dto);
  }
}
