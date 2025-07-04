import {
  Injectable,
  HttpStatus,
  HttpException,
  Inject,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { VerifyRegistrationDto, VeryfiAuthenticationDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
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
  private readonly RP_NAME: string;
  private readonly RP_ID: string;
  private readonly RP_ORIGIN: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject('DYNAMO_CLIENT') private dynamoClient: DynamoDBDocument,
  ) {
    this.RP_NAME = this.configService.get<string>('RP_NAME', 'undefined');
    this.RP_ID = this.configService.get<string>('RP_ID', 'undefined');
    this.RP_ORIGIN = this.configService.get<string>('RP_ORIGIN', 'undefined');
  }

  async generateRegistrationOptions(
    generateRegistrationDto: GenerateRegistrationOptionsDto,
  ) {
    const { email } = generateRegistrationDto;

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
            connectOrCreate: {
              where: { email: email },
              create: {
                email: email,
                provider: 'Webauthn',
                providerId: credential.id,
                userConfirmed: false,
              },
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

  async sendVerificationCode(email: string) {
    try {
      const verificationCode = Math.floor(
        1000 + Math.random() * 9000,
      ).toString();

      // Store the verification code in DynamoDB with a TTL of 5 minutes
      await this.dynamoClient.put({
        TableName: 'Registration',
        Item: {
          email,
          code: verificationCode,
          ttl: Math.floor(Date.now() / 1000) + 300,
        },
      });

      // You can send the verification code via email or other means here
      return {
        message: 'Verification code sent successfully',
      };
    } catch (error) {
      console.error('Error sending verification code:', error);
      throw new HttpException(
        'Failed to send verification code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyCode(email: string, code: string) {
    try {
      // Retrieve the verification code from DynamoDB
      const cachedCode = await this.dynamoClient.get({
        TableName: 'Registration',
        Key: { email },
        AttributesToGet: ['code'],
      });

      if (!cachedCode.Item || cachedCode.Item.code !== code) {
        throw new BadRequestException('Invalid or expired verification code');
      }

      // If the code is valid, you can proceed with further actions, like confirming the user
      return {
        verification: true,
        message: 'Verification code is valid',
      };
    } catch (error) {
      console.error('Error verifying code:', error);
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new HttpException(
        'Failed to verify code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
