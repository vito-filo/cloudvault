import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.authenticateWithCognito(loginDto);
  }

  @Post('signup')
  signUp(@Body() signupDto: SignupDto) {
    return this.authService.signUpWithCognito(signupDto);
  }
}
