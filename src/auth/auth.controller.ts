import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfirmSignupDto, LoginDto, SignupDto } from './dto';

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

  @Post('confirm-email')
  confirm(@Body() confirmSignipDto: ConfirmSignupDto) {
    return this.authService.confirmSignUp(confirmSignipDto);
  }
}
