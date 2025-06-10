import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateGroupDto,
  GetGroupDetailsQueryDto,
  UpdateGroupDto,
  GetGroupListDto,
  GetGroupDetailsDto,
} from './dto';
import { plainToInstance } from 'class-transformer';
import { PrismaPromise } from '@prisma/client';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  async getAllGroups(userId: string): Promise<GetGroupListDto[]> {
    try {
      const groups = await this.prisma.group.findMany({
        where: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return groups.map((group) =>
        plainToInstance(GetGroupListDto, group, {
          excludeExtraneousValues: true,
        }),
      );
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw new Error('Failed to fetch groups');
    }
  }

  async getGroupDetails({
    userId,
    groupId,
  }: GetGroupDetailsQueryDto): Promise<GetGroupDetailsDto> {
    const isInGroup = await this.prisma.isInGroup(userId, groupId);
    if (!isInGroup) {
      throw new ForbiddenException();
    }

    try {
      const response = await this.prisma.group.findUnique({
        where: { id: groupId },
        include: {
          members: {
            select: {
              user: {
                select: {
                  email: true,
                  name: true,
                },
              },
              isAdmin: true,
            },
          },
        },
      });
      console.log('Group details response:', response);
      return plainToInstance(GetGroupDetailsDto, response, {
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
  ): Promise<GetGroupListDto> {
    try {
      const users: Array<{ id: string }> = [{ id: userId }];
      if (
        createGroupDto.membersEmail &&
        createGroupDto.membersEmail.length !== 0
      ) {
        // convert user emails to user IDs
        const membersIds = await this.findIds(
          createGroupDto.membersEmail,
          userId,
        );
        users.push(...membersIds);
      }

      const { name, description } = createGroupDto;
      // const users = [{ id: userId }, ...(userIds?.map((id) => ({ id })) || [])];

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

      return plainToInstance(GetGroupListDto, response, {
        excludeExtraneousValues: true,
      });
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
    const transactionList: PrismaPromise<any>[] = [];

    // Update group details
    transactionList.push(
      this.prisma.group.update({
        where: { id: groupId },
        data: {
          name: updateGroupDto.name,
          description: updateGroupDto.description,
        },
      }),
    );

    // Get the current members of the group
    if (updateGroupDto.membersEmail) {
      const members = await this.prisma.group.findMany({
        where: { id: groupId },
        select: {
          members: {
            select: {
              userId: true,
            },
          },
        },
      });
      const currentMembers = members[0]?.members; // Assuming only one group (groupId) is returned
      const updateMembers = await this.findIds(
        updateGroupDto.membersEmail,
        userId,
      );

      // Check for members to add to the group
      const connectMembers = updateMembers
        .map((value) => {
          if (!currentMembers.some((member) => member.userId === value.id)) {
            return value.id;
          }
        })
        .filter((userId) => userId !== undefined);
      if (connectMembers.length !== 0) {
        connectMembers.forEach((userId) => {
          transactionList.push(
            this.prisma.groupMember.upsert({
              where: {
                groupId_userId: {
                  groupId: groupId,
                  userId: userId,
                },
              },
              create: {
                groupId: groupId,
                userId: userId,
                isAdmin: false,
              },
              update: {},
            }),
          );
        });
      }

      // Check for members to remove from the group
      const disconnectMembers = currentMembers
        .map((value) => {
          if (
            !updateMembers.some((member) => member.id === value.userId) &&
            value.userId !== userId
          ) {
            return value.userId;
          }
        })
        .filter((userId) => userId !== undefined);

      if (disconnectMembers.length !== 0) {
        transactionList.push(
          this.prisma.groupMember.deleteMany({
            where: {
              groupId,
              userId: {
                in: disconnectMembers,
              },
            },
          }),
        );
      }
    }
    try {
      const result = await this.prisma.$transaction(transactionList);
      return plainToInstance(GetGroupListDto, result[0], {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error updating group:', error);
      throw new Error('Failed to update group');
    }
  }

  private async findIds(membersEmail: string[] | undefined, userId: string) {
    // convert user emails to user IDs
    if (!membersEmail || membersEmail.length === 0) {
      return [];
    }
    const userIds = await this.prisma.user.findMany({
      where: {
        AND: [
          { email: { in: membersEmail } },
          { id: { not: userId } }, // Exclude the creator from the members
        ],
      },
    });
    return userIds.map((u) => ({ id: u.id }));
  }
}
