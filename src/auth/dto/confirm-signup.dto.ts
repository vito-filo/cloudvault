import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class ConfirmSignupDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  userSub: string; // User id (Sub) from Cognito, returned after signup

  @IsOptional()
  name?: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'Code must contain at least 6 characters' })
  code: string;
}
