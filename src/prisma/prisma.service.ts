import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async isInGroup(userId: string, groupId: string): Promise<boolean> {
    // Check if the user is in a specific group
    try {
      const group = await this.group.findFirst({
        where: {
          AND: [{ id: groupId }, { members: { some: { userId: userId } } }],
        },
        select: { id: true },
      });

      return !!group; // Returns true if the group exists and the user is a member
    } catch (error) {
      console.error('Error checking group membership:', error);
      throw new Error('Failed to check group membership');
    }
  }

  async isPasswordOwner(userId: string, passwordId: string): Promise<boolean> {
    // Check if the user is the owner of a password
    // Or is the admin of a group that has access to the password
    try {
      const password = await this.password.findFirst({
        where: {
          id: passwordId,
          OR: [
            { ownerId: userId },
            {
              groupShares: {
                some: {
                  group: {
                    members: { some: { userId: userId, isAdmin: true } },
                  },
                },
              },
            },
          ],
        },
      });

      if (!password) {
        return false; // Password not found or user is not the owner
      }

      return true; // Placeholder return value
    } catch (error) {
      console.error('Error checking password ownership:', error);
      throw new Error('Failed to check password ownership');
    }
  }
}
