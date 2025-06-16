import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ConfirmSignupDto,
  LoginDto,
  SignupDto,
  VerifyRegistrationDto,
  GenerateRegistrationOptionsDto,
  VeryfiAuthenticationDto,
} from './dto';
import { Public } from './jwt-auth.guard';

@Public() // These routes as public
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

  @Get('/webauthn/generate-registration-options')
  generateRegistrationOptions(@Query() query: GenerateRegistrationOptionsDto) {
    return this.authService.generateRegistrationOptions(query);
  }

  @Post('/webauthn/verify-registration-response')
  verifyRegistrationResponse(
    @Body() verifyRegistrationDto: VerifyRegistrationDto,
  ) {
    return this.authService.verifyRegistrationResponse(verifyRegistrationDto);
  }

  @Get('/webauthn/generate-authentication-options')
  getAuthenticationOptions(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email parameter is required');
    }
    return this.authService.getAuthenticationOptions(email);
  }

  @Post('/webauthn/verify-authentication-response')
  verifyAuthenticationResponse(
    @Body() verifyAuthenticationDto: VeryfiAuthenticationDto,
  ) {
    return this.authService.verifyAuthenticationResponse(
      verifyAuthenticationDto,
    );
  }
}
