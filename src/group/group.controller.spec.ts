// Disable unbound-method eslint rule, as we are using Jest to mock the service methods
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GroupService } from './group.service';
import { GetGroupDto } from './dto';

// This unit tests assert that the GroupController:
// - is defined correctly
// - return the expected results when called with mock data.
// - call the service methods with the correct arguments
// - handle errors correctly

describe('GroupController', () => {
  let controller: GroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [GroupController],
      providers: [GroupService],
    }).compile();

    controller = module.get<GroupController>(GroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

describe('GroupController', () => {
  let controller: GroupController;
  let service: GroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
        {
          provide: GroupService,
          useValue: {
            getAllGroups: jest.fn(() => {}),
            createGroup: jest.fn(() => {}),
            updateGroup: jest.fn(() => {}),
            deleteGroup: jest.fn(() => {}),
          },
        },
      ],
    }).compile();

    controller = module.get<GroupController>(GroupController);
    service = module.get<GroupService>(GroupService);
  });

  describe('getGroups', () => {
    it('should return all groups for a user', async () => {
      const mockGroupList: GetGroupDto[] = [
        {
          id: 'uuid1',
          name: 'Group 1',
          description: 'Description 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          members: [
            { userId: 'user1', isAdmin: true },
            { userId: 'user2', isAdmin: false },
          ],
        },
        {
          id: 'uuid2',
          name: 'Group 2',
          description: 'Description 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          members: [
            { userId: 'user3', isAdmin: false },
            { userId: 'user4', isAdmin: true },
          ],
        },
      ];
      jest.spyOn(service, 'getAllGroups').mockResolvedValue(mockGroupList);
      const result = await controller.getGroups('user123');
      expect(result).toEqual(mockGroupList);
      expect(service.getAllGroups).toHaveBeenCalledWith('user123');
    });

    it('should handle errors when fetching groups', async () => {
      jest
        .spyOn(service, 'getAllGroups')
        .mockRejectedValue(new Error('Error fetching groups'));
      await expect(controller.getGroups('user123')).rejects.toThrow(
        'Error fetching groups',
      );
    });
  });

  describe('createGroup', () => {
    it('should create a new group', async () => {
      const mockGroup: GetGroupDto = {
        id: 'uuid1',
        name: 'New Group',
        description: 'New Group Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [{ userId: 'user123', isAdmin: true }],
      };
      jest.spyOn(service, 'createGroup').mockResolvedValue(mockGroup);
      const result = await controller.createGroup('user123', {
        name: 'New Group',
        description: 'New Group Description',
        userIds: ['user123'],
      });
      expect(result).toEqual(mockGroup);
      expect(service.createGroup).toHaveBeenCalledWith('user123', {
        name: 'New Group',
        description: 'New Group Description',
        userIds: ['user123'],
      });
    });

    it('should handle errors when creating a group', async () => {
      jest
        .spyOn(service, 'createGroup')
        .mockRejectedValue(new Error('Error creating group'));
      await expect(
        controller.createGroup('user123', {
          name: 'New Group',
          description: 'New Group Description',
          userIds: ['user123'],
        }),
      ).rejects.toThrow('Error creating group');
    });
  });

  describe('updateGroup', () => {
    it('should update an existing group', async () => {
      const mockGroup: GetGroupDto = {
        id: 'uuid1',
        name: 'Updated Group',
        description: 'Updated Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [{ userId: 'user123', isAdmin: true }],
      };
      jest.spyOn(service, 'updateGroup').mockResolvedValue(mockGroup);
      const result = await controller.updateGroup('user123', 'uuid1', {
        name: 'Updated Group',
        description: 'Updated Description',
      });
      expect(result).toEqual(mockGroup);
      expect(service.updateGroup).toHaveBeenCalledWith('user123', 'uuid1', {
        name: 'Updated Group',
        description: 'Updated Description',
      });
    });

    it('should handle errors when updating a group', async () => {
      jest
        .spyOn(service, 'updateGroup')
        .mockRejectedValue(new Error('Error updating group'));
      await expect(
        controller.updateGroup('user123', 'uuid1', {
          name: 'Updated Group',
          description: 'Updated Description',
        }),
      ).rejects.toThrow('Error updating group');
    });
  });

  describe('deleteGroup', () => {
    it('should delete an existing group', async () => {
      jest.spyOn(service, 'deleteGroup').mockResolvedValue();
      await controller.deleteGroup('user123', 'uuid1');
      expect(service.deleteGroup).toHaveBeenCalledWith('user123', 'uuid1');
    });

    it('should handle errors when deleting a group', async () => {
      jest
        .spyOn(service, 'deleteGroup')
        .mockRejectedValue(new Error('Error deleting group'));
      await expect(controller.deleteGroup('user123', 'uuid1')).rejects.toThrow(
        'Error deleting group',
      );
    });
  });
});
