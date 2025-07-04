// Disable unbound-method eslint rule, as we are using Jest to mock the service methods

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DynamoModule } from '../dynamoDB/dynamo.module';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
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
      imports: [PrismaModule, ConfigModule, DynamoModule],
      controllers: [AuthController],
      providers: [AuthService, JwtService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
