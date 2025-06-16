import { IsNotEmpty } from 'class-validator';

export class GenerateRegistrationOptionsDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  userName: string;
}
