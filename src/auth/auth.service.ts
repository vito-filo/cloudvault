import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
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
  async authenticateWithCognito(loginDto: LoginDto) {
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
      return client.send(command);
    } catch (error) {
      console.error('Error during authentication:', error);
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
