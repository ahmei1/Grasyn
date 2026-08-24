import { Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('notifications')
@Controller()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('workspaces/:workspaceId/notifications')
  list(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
    @Query() page: PaginationQueryDto,
  ) {
    return this.notifications.list(user.id, workspaceId, page.page, page.pageSize);
  }

  @Patch('notifications/:notificationId/read')
  markRead(
    @CurrentUser() user: AuthUser,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notifications.markRead(user.id, notificationId);
  }

  @Post('workspaces/:workspaceId/notifications/read-all')
  markAll(
    @CurrentUser() user: AuthUser,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.notifications.markAllRead(user.id, workspaceId);
  }
}
