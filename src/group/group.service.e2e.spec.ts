import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

describe('GroupService', () => {
  let service: GroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupService, PrismaService, ConfigService],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('deleteGroup', () => {
  let service: GroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupService, PrismaService, ConfigService],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  it('should thow error if the group contains passwords', async () => {
    const userId = '1e862f3c-d251-41ec-bd96-62d59e570a4c';
    const groupId = 'h5e862f3c-d251-41ec-bd96-62d59e570a4c';

    await expect(service.deleteGroup(userId, groupId)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
