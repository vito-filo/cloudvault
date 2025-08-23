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
  VerifyRegistrationDto,
  GenerateRegistrationOptionsDto,
  VeryfiAuthenticationDto,
} from './dto';
import { Public } from './jwt-auth.guard';

@Public() // These routes as public
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('send-verification-code')
  sendVerificationCode(
    @Body('email') email: string,
    @Body('username') username: string,
  ) {
    if (!email || !username) {
      throw new BadRequestException('Email and Username are required');
    }
    return this.authService.sendVerificationCode(email, username);
  }

  @Post('verify-code')
  verifyCode(@Body('email') email: string, @Body('code') code: string) {
    if (!email || !code) {
      throw new BadRequestException('Email and code are required');
    }
    return this.authService.verifyCode(email, code);
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
