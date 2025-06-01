// Disable unbound-method eslint rule, as we are using Jest to mock the service methods
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { SignupDto, LoginDto, ConfirmSignupDto, LoginOutputDto } from './dto';
import {
  SignUpCommandOutput,
  ConfirmDeviceCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// This unit tests assert that the AuthController:
// - is defined correctly
// - return the expected results when called with mock data.
// - call the service methods with the correct arguments
// - handle errors correctly

describe('PasswordController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, ConfigModule],
      controllers: [AuthController],
      providers: [AuthService, JwtService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            authenticateWithCognito: jest.fn(() => {}),
            signUpWithCognito: jest.fn(() => {}),
            confirmSignUp: jest.fn(() => {}),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    const mockSignupDto: SignupDto = {
      email: 'alice@gmail.com',
      password: 'password123',
    };

    const mockSignUpCommandOutput: SignUpCommandOutput = {
      $metadata: {},
      UserConfirmed: false,
      UserSub: 'mockUserSub',
    };

    it('should call signUpWithCognito with the correct parameters', async () => {
      jest
        .spyOn(service, 'signUpWithCognito')
        .mockResolvedValue(mockSignUpCommandOutput);

      const result = await controller.signUp(mockSignupDto);
      expect(result).toEqual(mockSignUpCommandOutput);
      expect(service.signUpWithCognito).toHaveBeenCalledWith(mockSignupDto);
    });

    it('should throw an error if signUpWithCognito fails', async () => {
      jest
        .spyOn(service, 'signUpWithCognito')
        .mockRejectedValue(new BadRequestException('Error signing up'));
      await expect(controller.signUp(mockSignupDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    const mockLoginDto: LoginDto = {
      email: 'alice@gmail.com',
      password: 'password123',
    };
    const mockLoginOutputDto: LoginOutputDto = {
      accessToken: 'mockAccessToken',
      user: {
        id: '123',
        email: 'mock@email.com',
      },
    };
    it('should call authenticateWithCognito with the correct parameters', async () => {
      jest
        .spyOn(service, 'authenticateWithCognito')
        .mockResolvedValue(mockLoginOutputDto);

      const result = await controller.signIn(mockLoginDto);
      expect(result).toEqual(mockLoginOutputDto);
      expect(service.authenticateWithCognito).toHaveBeenCalledWith(
        mockLoginDto,
      );
    });

    it('should throw an error if authenticateWithCognito fails', async () => {
      jest
        .spyOn(service, 'authenticateWithCognito')
        .mockRejectedValue(new BadRequestException('Error logging in'));
      await expect(controller.signIn(mockLoginDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('confirm-email', () => {
    const mockConfirmSignupDto: ConfirmSignupDto = {
      email: 'alice@email.com',
      userSub: '123456',
      code: '123456',
    };
    const mockConfirmSignUpCommandOutput: ConfirmDeviceCommandOutput = {
      $metadata: {},
    };
    it('should call confirmSignUp with the correct parameters', async () => {
      jest
        .spyOn(service, 'confirmSignUp')
        .mockResolvedValue(mockConfirmSignUpCommandOutput);

      const result = await controller.confirm(mockConfirmSignupDto);
      expect(result).toEqual(mockConfirmSignUpCommandOutput);
      expect(service.confirmSignUp).toHaveBeenCalledWith(mockConfirmSignupDto);
    });

    it('should throw an error if confirmSignUp fails', async () => {
      jest
        .spyOn(service, 'confirmSignUp')
        .mockRejectedValue(new BadRequestException('Error confirming email'));
      await expect(controller.confirm(mockConfirmSignupDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
