import { Password as PasswordMOdel } from '@prisma/client';
import { Expose } from 'class-transformer';

export class GetPasswordDetailDto implements PasswordMOdel {
  @Expose() password: string;
  @Expose() id: number;
  @Expose() url: string | null;
  @Expose() serviceName: string;
  @Expose() username: string | null;
  @Expose() email: string | null;
  @Expose() description: string | null;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
  @Expose() userId: number | null;
}
