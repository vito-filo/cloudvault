import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GetPasswordsQueryDto } from './dto';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService, PrismaService, ConfigService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('getAllPasswordsByGroup', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService, PrismaService, ConfigService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should return all passwords for a specific group', async () => {
    const userId = '1e862f3c-d251-41ec-bd96-62d59e570a4c';
    const groupId = '8d050e80-6e7c-45c0-9ec5-ebb9312318a8';

    const query: GetPasswordsQueryDto = { userId, groupId };
    const result = await service.getAllPasswords(query);

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});
