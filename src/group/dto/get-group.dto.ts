import { Expose } from 'class-transformer';

export class GetGroupDto {
  @Expose() id: number;
  @Expose() description?: string;
  @Expose() name: string;
  @Expose() members?: { userId: string; isAdmin: boolean }[];
  @Expose() updatedAt: Date;
  @Expose() createdAt: Date;
}
