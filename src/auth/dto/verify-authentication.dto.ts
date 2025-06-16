import { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { IsNotEmpty } from 'class-validator';

export class VeryfiAuthenticationDto {
  @IsNotEmpty()
  response: AuthenticationResponseJSON;

  @IsNotEmpty()
  email: string;
}
