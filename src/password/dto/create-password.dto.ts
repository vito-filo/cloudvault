import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePasswordDto {
  @IsOptional()
  @IsString()
  url?: string;

  @IsString()
  serviceName: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  groupIds?: string[];
}
