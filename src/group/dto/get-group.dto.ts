import { Expose } from 'class-transformer';

export class GetGroupDto {
  @Expose() id: number;
  @Expose() description?: string;
  @Expose() name: string;
  @Expose() userIds?: number[]; // Regular group members
  @Expose() adminIds?: number[]; // Admin users
  @Expose() updatedAt: Date;
  @Expose() createdAt: Date;
}
