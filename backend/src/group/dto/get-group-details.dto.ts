import { Expose, Type } from 'class-transformer';

export class UserDto {
  @Expose()
  email: string;

  @Expose()
  name: string;
}

export class MemberDto {
  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  isAdmin: boolean;
}

export class GetGroupDetailsDto {
  @Expose() id: string;
  @Expose() description?: string;
  @Expose() name: string;
  @Expose()
  @Type(() => MemberDto)
  members: MemberDto[];
  @Expose() updatedAt: Date;
  @Expose() createdAt: Date;
}
