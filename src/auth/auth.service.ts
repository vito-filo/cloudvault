import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  SignUpCommandOutput,
  InitiateAuthCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly CLIENT_ID: string;
  private readonly CLIENT_SECRET: string;

  constructor(private readonly configService: ConfigService) {
    this.CLIENT_ID = this.configService.get<string>('CLIENT_ID', 'undefined');
    this.CLIENT_SECRET = this.configService.get<string>(
      'CLIENT_SECRET',
      'undefined',
    );
  }

  private generateSecretHash(
    username: string,
    clientId: string,
    clientSecret: string,
  ) {
    return crypto
      .createHmac('SHA256', clientSecret)
      .update(username + clientId)
      .digest('base64');
  }

  async authenticateWithCognito(
    loginDto: LoginDto,
  ): Promise<InitiateAuthCommandOutput> {
    try {
      const client = new CognitoIdentityProviderClient({
        region: 'eu-south-1',
      });

      const command = new InitiateAuthCommand({
        // UserPoolId: USER_POOL_ID,
        ClientId: this.CLIENT_ID,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: loginDto.email,
          PASSWORD: loginDto.password,
          SECRET_HASH: this.generateSecretHash(
            loginDto.email,
            this.CLIENT_ID,
            this.CLIENT_SECRET,
          ),
        },
      });
      return await client.send(command);
    } catch (error) {
      console.error('Error during authentication:', error);
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  async signUpWithCognito(signupDto: SignupDto): Promise<SignUpCommandOutput> {
    try {
      const client = new CognitoIdentityProviderClient({
        region: 'eu-south-1',
      });

      const signUpCommand = new SignUpCommand({
        ClientId: this.CLIENT_ID,
        SecretHash: this.generateSecretHash(
          signupDto.email,
          this.CLIENT_ID,
          this.CLIENT_SECRET,
        ),
        Username: signupDto.email,
        Password: signupDto.password,
      });
      return await client.send(signUpCommand);
    } catch (error) {
      console.error('Error during sign up:', error);
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }
}
