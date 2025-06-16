import { RegistrationResponseJSON } from '@simplewebauthn/server';
import { IsNotEmpty } from 'class-validator';
export class VerifyRegistrationDto {
  @IsNotEmpty()
  response: RegistrationResponseJSON;

  @IsNotEmpty()
  email: string;
}
