import { Expose } from 'class-transformer';

export class GetGroupListDto {
  @Expose() id: string;
  @Expose() description?: string;
  @Expose() name: string;
  @Expose() updatedAt: Date;
  @Expose() createdAt: Date;
}
