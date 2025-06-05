import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateGroupDto,
  GetGroupDetailsQueryDto,
  GetGroupDto,
  UpdateGroupDto,
} from './dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  async getAllGroups(userId: string): Promise<GetGroupDto[]> {
    try {
      const groups = await this.prisma.group.findMany({
        where: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          members: {
            select: {
              userId: true,
              isAdmin: true,
            },
          },
        },
      });

      return groups.map((group) =>
        plainToInstance(GetGroupDto, group, { excludeExtraneousValues: true }),
      );
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw new Error('Failed to fetch groups');
    }
  }

  async getGroupDetails({
    userId,
    groupId,
  }: GetGroupDetailsQueryDto): Promise<GetGroupDto> {
    const isInGroup = await this.prisma.isInGroup(userId, groupId);
    if (!isInGroup) {
      throw new ForbiddenException();
    }

    try {
      const response = await this.prisma.group.findUnique({
        where: { id: groupId },
      });
      return plainToInstance(GetGroupDto, response, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error fetching group details:', error);
      throw new Error('Failed to fetch group details');
    }
  }

  async searchUserByName(
    name: string,
  ): Promise<{ name: string | null; email: string }[]> {
    // TODO make the username mandatory in the DB schema
    try {
      const users = await this.prisma.user.findMany({
        where: {
          OR: [{ email: { contains: name } }, { name: { contains: name } }],
        },
        select: {
          email: true,
          name: true,
        },
      });

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  }

  async createGroup(
    userId: string,
    createGroupDto: CreateGroupDto,
  ): Promise<GetGroupDto> {
    try {
      const { name, description, userIds } = createGroupDto;
      const users = [{ id: userId }, ...(userIds?.map((id) => ({ id })) || [])];

      const response = await this.prisma.group.create({
        data: {
          name: name,
          description: description,
          createdBy: { connect: { id: userId } },
          members: {
            create: users.map((u) => ({
              user: { connect: { id: u.id } },
              isAdmin: u.id === userId,
            })),
          },
        },
      });

      return plainToInstance(GetGroupDto, response);
    } catch (error) {
      console.error('Error creating group:', error);
      throw new Error('Failed to create group');
    }
  }

  async deleteGroup(userId: string, groupId: string) {
    // Check if the user is an admin of the group
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { members: { where: { userId: userId, isAdmin: true } } },
    });

    if (!group) {
      throw new ForbiddenException('User is not an admin of this group');
    }

    // Check if group has passwords associated with it
    const passwords = await this.prisma.password.findMany({
      where: {
        groupShares: {
          some: {
            groupId: groupId,
          },
        },
      },
    });

    if (passwords.length > 0) {
      throw new ForbiddenException(
        'Cannot delete group with associated passwords',
      );
    }

    try {
      // Delete the group
      await this.prisma.group.delete({
        where: { id: groupId },
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      // throw new Error('Failed to delete group');
    }
  }

  async updateGroup(
    userId: string,
    groupId: string,
    updateGroupDto: UpdateGroupDto,
  ) {
    try {
      const group = await this.prisma.group.update({
        where: {
          id: groupId,
          members: {
            some: {
              userId: userId,
              isAdmin: true,
            },
          },
        },
        data: updateGroupDto,
      });

      return plainToInstance(GetGroupDto, group, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error updating group:', error);
      throw new Error('Failed to update group');
    }
  }
}
