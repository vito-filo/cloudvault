import { Expose } from 'class-transformer';

// This DTO is used to return a password without sensitive information
// used for listing all passwords, or returning a created/updated passeword info.
export class GetPasswordDto {
  @Expose()
  id: string;

  @Expose()
  serviceName: string | null;

  @Expose()
  url: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
