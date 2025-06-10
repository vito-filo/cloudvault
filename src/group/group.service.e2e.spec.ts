import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';
import { CreateGroupDto } from './dto';

const fartingtonId = '1e862f3c-d251-41ec-bd96-62d59e570a4c';
const familyGroupId = 'af1c66b2-af96-4bce-85fd-b11c40db511f';

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

  describe('deleteGroup', () => {
    it('should thow error if the group contains passwords', async () => {
      const userId = '1e862f3c-d251-41ec-bd96-62d59e570a4c';
      const groupId = 'h5e862f3c-d251-41ec-bd96-62d59e570a4c';

      await expect(service.deleteGroup(userId, groupId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Create Group', () => {
    it('should create a group', async () => {
      const createGroupDto: CreateGroupDto = {
        name: 'Test Group',
        description: 'This is a test group',
        membersEmail: ['fertemupsa@gufum.com', 'alice@example.com'],
      };
      const userId = '1e862f3c-d251-41ec-bd96-62d59e570a4c'; // Fartington's ID
    });
  });

  describe('Update Group', () => {
    it('should update a group detail', async () => {
      const updateGroupDto = {
        name: 'Updated Group Name',
        description: 'Updated group description',
      };

      const result = await service.updateGroup(
        fartingtonId,
        familyGroupId,
        updateGroupDto,
      );
      expect(result).toBeDefined();
    });

    it('shoud update group members', async () => {
      // remove alice and bob from group Family
      // add charlie and dave to group Family
      const membersEmail = ['charlie@example.com', 'dave@example.com'];
      const updateGroupDto = {
        name: 'Family new',
        description: 'Family group with new members',
        membersEmail: membersEmail,
      };
      const result = await service.updateGroup(
        fartingtonId,
        familyGroupId,
        updateGroupDto,
      );
      expect(result).toBeDefined();
    });
  });
});
