import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { ConfirmSignupDto, LoginDto, SignupDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  SignUpCommandOutput,
  InitiateAuthCommandOutput,
  ConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly CLIENT_ID: string;
  private readonly CLIENT_SECRET: string;
  private readonly client: CognitoIdentityProviderClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.CLIENT_ID = this.configService.get<string>('CLIENT_ID', 'undefined');
    this.CLIENT_SECRET = this.configService.get<string>(
      'CLIENT_SECRET',
      'undefined',
    );
    this.client = new CognitoIdentityProviderClient({
      region: 'eu-south-1',
    });
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
      return await this.client.send(command);
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

  async confirmSignUp(confirmSignUpDto: ConfirmSignupDto) {
    const command = new ConfirmSignUpCommand({
      ClientId: this.CLIENT_ID,
      SecretHash: this.generateSecretHash(
        confirmSignUpDto.email,
        this.CLIENT_ID,
        this.CLIENT_SECRET,
      ),
      Username: confirmSignUpDto.email,
      ConfirmationCode: confirmSignUpDto.code,
    });

    try {
      const response = await this.client.send(command);
      await this.prisma.user.upsert({
        create: {
          email: confirmSignUpDto.email,
          name: confirmSignUpDto.name,
          provider: 'Cognito',
          providerId: confirmSignUpDto.userSub,
          userConfirmed: true,
        },
        update: {
          userConfirmed: true,
        },
        where: { email: confirmSignUpDto.email },
      });
      return response;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error during confirmation:', error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
    }
  }
}
