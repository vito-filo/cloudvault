import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  membersEmail?: string[]; // Regular group members by email
}
