import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddProjectMemberDto {
  @ApiProperty()
  @IsString()
  userId: string;
}
