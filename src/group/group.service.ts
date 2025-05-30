import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGroupDto, GetGroupDto } from './dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}

  async createGroup(
    userId: number,
    createGroupDto: CreateGroupDto,
  ): Promise<GetGroupDto> {
    try {
      const { name, description, userIds, adminIds } = createGroupDto;
      const users = [{ id: userId }, ...(userIds?.map((id) => ({ id })) || [])];
      const admins = [
        { id: userId },
        ...(adminIds?.map((id) => ({ id })) || []),
      ];

      const response = await this.prisma.group.create({
        data: {
          name: name,
          description: description,
          users: { connect: users }, // Connect existing users
          admins: { connect: admins }, // Connect existing admins
        },
      });

      console.log('Group created successfully:', response);
      return plainToInstance(GetGroupDto, response);
    } catch (error) {
      console.error('Error creating group:', error);
      throw new Error('Failed to create group');
    }
  }

  async deleteGroup(userId: number, groupId: number) {
    try {
      // Check if the user is an admin of the group
      const group = await this.prisma.group.findUnique({
        where: { id: groupId },
        select: { admins: { where: { id: userId } } },
      });

      if (!group || group.admins.length === 0) {
        throw new ForbiddenException('User is not an admin of this group');
      }

      // Delete the group
      await this.prisma.group.delete({
        where: { id: groupId },
      });

      console.log(`Group with ID ${groupId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting group:', error);
      // throw new Error('Failed to delete group');
    }
  }
}
