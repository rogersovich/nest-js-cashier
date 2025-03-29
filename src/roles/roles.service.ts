import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Role } from './roles.entity';
import { RoleUpdateDto } from './dto/role-update.dto';
import { TSelectOption } from 'src/common/interfaces/general-response.interface';
import { BaseRawService } from 'src/raw/base-raw.service';
import { RoleSearchDto } from './dto/role-search.dto';
import { RoleSearchOutputDto } from './dto/role-output.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly baseRawService: BaseRawService,
  ) {}

  async findAll(dto: RoleSearchDto): Promise<RoleSearchOutputDto[]> {
    const { whereClause, params: whereParams } =
      this.baseRawService.buildDynamicWhere(dto.filters ?? {}, ['name']);

    const { clause: sortClause, params: paginationParams } =
      this.baseRawService.buildPaginationAndSort(
        dto.order_by ?? 'id',
        dto.sort ?? 'ASC',
        dto.page,
        dto.limit,
        ['id', 'name', 'createdAt'],
      );

    const sql = `
      SELECT id, name
      FROM roles
      ${whereClause}
      ${sortClause}
    `;

    const fullParams = [...whereParams, ...paginationParams];

    return this.baseRawService.query<RoleSearchOutputDto>(sql, fullParams);
  }

  async getOptions(): Promise<TSelectOption<number>[]> {
    const roles = await this.dataSource
      .createQueryBuilder()
      .select(['role.id AS value', 'role.name AS label'])
      .from(Role, 'role')
      .orderBy('role.id', 'ASC')
      .getRawMany();

    return roles as TSelectOption<number>[];
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  create(name: string): Promise<Role> {
    const role = this.roleRepository.create({ name });
    return this.roleRepository.save(role);
  }

  async update(id: number, dto: RoleUpdateDto) {
    const role = await this.roleRepository.findOneBy({ id });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Only update the fields provided
    if (dto.name) {
      role.name = dto.name;
    }

    return this.roleRepository.save(role);
  }

  async remove(id: number) {
    const role = await this.roleRepository.findOneBy({ id });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    await this.roleRepository.delete(id);

    return {
      data: null,
      message: `Role with ID ${id} successfully deleted`,
    };
  }
}
