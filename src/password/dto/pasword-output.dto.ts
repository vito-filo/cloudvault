import { Expose } from 'class-transformer';

// This is a safe format for outputting password data to the client.
export class PasswordOutputDto {
  @Expose()
  id: number;

  @Expose()
  serviceName: string | null;

  @Expose()
  url: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
