import {
  Injectable,
  HttpStatus,
  HttpException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ConfirmSignupDto,
  LoginDto,
  SignupDto,
  LoginOutputDto,
  VerifyRegistrationDto,
  VeryfiAuthenticationDto,
} from './dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  SignUpCommandOutput,
  ConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  AuthenticatorTransportFuture,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { GenerateRegistrationOptionsDto } from './dto/generate-registration-options.dto';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class AuthService {
  private readonly CLIENT_ID: string;
  private readonly CLIENT_SECRET: string;
  private readonly client: CognitoIdentityProviderClient;
  private readonly RP_NAME: string;
  private readonly RP_ID: string;
  private readonly RP_ORIGIN: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject('DYNAMO_CLIENT') private dynamoClient: DynamoDBDocument,
  ) {
    this.CLIENT_ID = this.configService.get<string>('CLIENT_ID', 'undefined');
    this.CLIENT_SECRET = this.configService.get<string>(
      'CLIENT_SECRET',
      'undefined',
    );
    this.client = new CognitoIdentityProviderClient({
      region: 'eu-south-1',
    });

    this.RP_NAME = this.configService.get<string>('RP_NAME', 'undefined');
    this.RP_ID = this.configService.get<string>('RP_ID', 'undefined');
    this.RP_ORIGIN = this.configService.get<string>('RP_ORIGIN', 'undefined');
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

  async authenticateWithCognito(loginDto: LoginDto): Promise<LoginOutputDto> {
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
      await this.client.send(command);
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { email: loginDto.email },
      });
      const payload = { sub: user.id, username: user.email };
      return {
        accessToken: await this.jwtService.signAsync(payload),
        user: {
          id: user.id,
          email: user.email,
        },
      };
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

  async generateRegistrationOptions(
    generateRegistrationDto: GenerateRegistrationOptionsDto,
  ) {
    const { email } = generateRegistrationDto;
    // TODO check if user already exists
    try {
      const userPasskeys = await this.prisma.passkey.findMany({
        where: { user: { email: email } },
      });

      const options: PublicKeyCredentialCreationOptionsJSON =
        await generateRegistrationOptions({
          rpName: this.RP_NAME,
          rpID: this.RP_ID,
          userName: email,
          attestationType: 'none',
          // Prevent users from re-registering existing authenticators
          excludeCredentials: userPasskeys.map((passkey) => ({
            id: passkey.id,
            // Optional
            transports: passkey.transport.split(
              ',',
            ) as AuthenticatorTransportFuture[],
          })),
          authenticatorSelection: {
            residentKey: 'discouraged',
            userVerification: 'preferred',
          },
        });

      // Store the options in the cache for 5 minutes
      await this.dynamoClient.put({
        TableName: 'Registration',
        Item: {
          email,
          options,
          ttl: Math.floor(Date.now() / 1000) + 300,
        },
      });

      return options;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new HttpException(
          'Email already exists',
          HttpStatus.CONFLICT, // 409 Conflict
        );
      }
      console.error('Error generating registration options:', error);
      throw new HttpException(
        'Something went wrong while generating registration options',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyRegistrationResponse(
    verifyRegistrationDto: VerifyRegistrationDto,
  ) {
    try {
      const email = verifyRegistrationDto.email;
      const cachedRawOptions = await this.dynamoClient.get({
        TableName: 'Registration',
        Key: { email },
        AttributesToGet: ['options'],
      });

      // TODO add zod checks
      const cachedOptions = cachedRawOptions.Item
        ?.options as PublicKeyCredentialCreationOptionsJSON;

      if (!cachedOptions) {
        throw new HttpException(
          `No registration options found for email: ${email}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const response = await verifyRegistrationResponse({
        response: verifyRegistrationDto.response,
        expectedChallenge: cachedOptions.challenge,
        expectedOrigin: this.RP_ORIGIN,
        expectedRPID: this.RP_ID,
      });

      const { registrationInfo } = response;
      if (!response.verified || !registrationInfo) {
        throw new HttpException(
          'Registration response verification failed',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Save the passkey to the database
      const { credential, credentialDeviceType, credentialBackedUp } =
        registrationInfo;

      await this.prisma.passkey.create({
        data: {
          user: {
            create: {
              email: email,
              provider: 'Webauthn',
              providerId: credential.id,
              userConfirmed: false,
            },
          },
          id: credential.id,
          publicKey: credential.publicKey,
          webauthnUserID: cachedOptions.user.id,
          counter: credential.counter,
          transport: credential.transports?.join(',') || '',
          deviceType: credentialDeviceType,
          backedUp: credentialBackedUp,
        },
      });

      return response;
    } catch (error) {
      console.error('Error during registration verification:', error);
      throw new HttpException(
        'Failed to verify registration response',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAuthenticationOptions(email: string) {
    try {
      const userPasskeys = await this.prisma.passkey.findMany({
        where: { user: { email: email } },
      });

      const options: PublicKeyCredentialRequestOptionsJSON =
        await generateAuthenticationOptions({
          rpID: this.RP_ID,
          allowCredentials: userPasskeys.map((passkey) => ({
            id: passkey.id,
            transports: passkey.transport.split(
              ',',
            ) as AuthenticatorTransportFuture[],
          })),
        });

      // Store the options in the cache for 5 minutes
      await this.dynamoClient.put({
        TableName: 'Registration',
        Item: {
          email,
          options,
          ttl: Math.floor(Date.now() / 1000) + 300,
        },
      });

      return options;
    } catch (error) {
      console.error('Error during authentication options retrieval:', error);
      throw new HttpException(
        'Failed to retrieve authentication options',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async verifyAuthenticationResponse(verificationDto: VeryfiAuthenticationDto) {
    try {
      const { email, response } = verificationDto;

      const cachedRawOptions = await this.dynamoClient.get({
        TableName: 'Registration',
        Key: { email },
        AttributesToGet: ['options'],
      });

      // TODO add zod checks
      const authOptions = cachedRawOptions.Item
        ?.options as PublicKeyCredentialRequestOptionsJSON;

      const userPasskey = await this.prisma.passkey.findFirst({
        where: {
          AND: [{ user: { email: email } }, { id: response.id }],
        },
      });

      if (!authOptions || !userPasskey) {
        throw new HttpException(
          `No authentication options found for email: ${email}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge: authOptions.challenge,
        expectedOrigin: this.RP_ORIGIN,
        expectedRPID: this.RP_ID,
        credential: {
          id: userPasskey.id,
          publicKey: userPasskey.publicKey,
          counter: userPasskey.counter,
          transports: userPasskey.transport.split(
            ',',
          ) as AuthenticatorTransportFuture[],
        },
      });

      if (verification.verified === false) {
        throw new UnauthorizedException('Authentication failed');
      }
      const payload = { sub: userPasskey.userId, username: email };
      return {
        verified: verification.verified,
        registrationInfo: verification.authenticationInfo,
        accessToken: await this.jwtService.signAsync(payload),
        user: {
          id: userPasskey.userId,
          email: email,
        },
      };
      return verification;
    } catch (error) {
      console.error('Error during authentication verification:', error);
      throw new HttpException(
        'Failed to verify authentication response',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
