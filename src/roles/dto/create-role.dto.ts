// src/roles/dto/create-role.dto.ts
import { IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  name: string;
}
