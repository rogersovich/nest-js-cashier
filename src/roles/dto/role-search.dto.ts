// src/roles/dto/role-search.dto.ts
import {
  IsOptional,
  IsString,
  IsIn,
  IsInt,
  Min,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RoleFiltersDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  is_delete?: boolean;
}

export class RoleSearchDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => RoleFiltersDto)
  filters?: RoleFiltersDto;

  @IsOptional()
  @IsString()
  order_by?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sort?: 'ASC' | 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
