import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateGroupDto {
  @IsString() name?: string;
  @IsString() description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  membersEmail?: string[]; // Regular group members by email
}
