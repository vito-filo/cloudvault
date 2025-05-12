import { Password as PasswordMOdel } from '@prisma/client';

export class PasswordDetailOutputDto implements PasswordMOdel {
  password: string;
  id: number;
  url: string | null;
  serviceName: string;
  username: string | null;
  email: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number | null;
}
