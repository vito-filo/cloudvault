import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GetPasswordsQueryDto } from './dto';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ envFilePath: '.env.development' })],
      providers: [PasswordService, PrismaService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllPasswordsByGroup', () => {
    it('should return all passwords for a specific group', async () => {
      const userId = '1e862f3c-d251-41ec-bd96-62d59e570a4c';
      const groupId = 'af1c66b2-af96-4bce-85fd-b11c40db511f';

      const query: GetPasswordsQueryDto = { userId, groupId };
      const result = await service.getAllPasswords(query);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
