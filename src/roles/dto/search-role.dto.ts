import { IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RoleFilter {
  @IsOptional()
  @IsString()
  name?: string;
}

export class SearchRoleDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => RoleFilter)
  filter?: RoleFilter;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sort?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  order_by?: string;
}
