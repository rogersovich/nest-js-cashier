import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleCreateDto } from './dto/role-create.dto';
import { RoleUpdateDto } from './dto/role-update.dto';
import { RoleSearchDto } from './dto/role-search.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  findAll(@Body() dto: RoleSearchDto) {
    return this.rolesService.findAll(dto);
  }

  @Get('option')
  selectOption() {
    return this.rolesService.getOptions();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Post('create')
  create(@Body() createRoleDto: RoleCreateDto) {
    return this.rolesService.create(createRoleDto.name);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateDto: RoleUpdateDto) {
    return this.rolesService.update(+id, updateDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
