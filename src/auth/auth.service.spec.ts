import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { DynamoModule } from '../dynamoDB/dynamo.module';
import { EmailModule } from '../email/email.module';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, ConfigModule, DynamoModule, EmailModule],
      controllers: [AuthController],
      providers: [AuthService, JwtService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined with dependencies', () => {
    expect(service).toBeDefined();
    expect(service['configService']).toBeDefined();
    expect(service['prisma']).toBeDefined();
    expect(service['jwtService']).toBeDefined();
    expect(service['dynamoClient']).toBeDefined();
  });
});
