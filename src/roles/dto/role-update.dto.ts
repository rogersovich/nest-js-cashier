import { IsOptional, IsString } from 'class-validator';

export class RoleUpdateDto {
  @IsOptional()
  @IsString()
  name?: string;
}
