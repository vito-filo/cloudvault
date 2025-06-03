import { IsUUID, IsOptional, IsNotEmpty } from 'class-validator';

export class GetPasswordsQueryDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsOptional()
  groupId?: string;
}
