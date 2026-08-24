import { Global, Module } from '@nestjs/common';
import { AccessService } from './access.service';
import { EventsService } from './events.service';

@Global()
@Module({
  providers: [AccessService, EventsService],
  exports: [AccessService, EventsService],
})
export class CommonModule {}
