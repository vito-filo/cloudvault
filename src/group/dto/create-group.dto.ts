import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsInt,
} from 'class-validator';

export class CreateGroupDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  userIds?: number[]; // Regular group members

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  adminIds?: number[]; // Admin users
}
