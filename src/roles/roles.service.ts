import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Role } from './roles.entity';
import { RoleUpdateDto } from './dto/role-update.dto';
import { TSelectOption } from 'src/common/interfaces/general-response.interface';
import { BaseRawService } from 'src/raw/base-raw.service';
import { RoleSearchDto } from './dto/role-search.dto';
import { RoleSearchOutputDto } from './dto/role-output.dto';
import { mergeWhereClause } from 'src/common/utils/query.util';

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

    const otherWhereClauses: string[] = [];
    const otherParams = [];

    //? Add where clause "is_delete"
    if (dto.is_delete) {
      otherWhereClauses.push('deleted_at IS NOT NULL');
    } else {
      otherWhereClauses.push('deleted_at IS NULL');
    }

    // const otherWhereClauses = ['branch_id = ?', 'status = ?'];
    // const otherParams = [1, 'active'];

    const finalWhereClause = mergeWhereClause(whereClause, otherWhereClauses);

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
      ${finalWhereClause}
      ${sortClause}
    `;

    const fullParams = [...whereParams, ...otherParams, ...paginationParams];

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
    const role = await this.roleRepository.findOne({
      where: { id },
      withDeleted: false, // hanya ambil yang belum di-soft delete
    });

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
    const role = await this.roleRepository.findOne({
      where: { id },
      withDeleted: false, // hanya ambil yang belum di-soft delete
    });

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
    const role = await this.roleRepository.findOne({
      where: { id },
      withDeleted: false, // hanya ambil yang belum di-soft delete
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    await this.roleRepository.softDelete(id); // ⬅️ soft delete!

    return {
      data: null,
      message: `Role successfully deleted`,
    };
  }
}
