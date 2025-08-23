import { IsNotEmpty, IsOptional } from 'class-validator';

export class GenerateRegistrationOptionsDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsOptional()
  userName: string;
}
