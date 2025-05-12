import { IsOptional, IsString } from 'class-validator';

export class PasswordUpdateInputDto {
  @IsOptional()
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  serviceName: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  description?: string;
}
