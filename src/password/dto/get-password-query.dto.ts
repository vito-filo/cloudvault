import { IsUUID, IsOptional } from 'class-validator';

export class GetPasswordsQueryDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  @IsOptional()
  groupId?: string;
}
