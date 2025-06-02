import { IsString } from 'class-validator';

export class UpdateGroupDto {
  @IsString() name?: string;
  @IsString() description?: string;
}
