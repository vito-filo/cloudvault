import { IsUUID, IsNotEmpty } from 'class-validator';

export class GetGroupDetailsQueryDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  groupId: string;
}
