import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Role } from './roles.entity';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SearchRoleDto } from './dto/search-role.dto';
import { TSelectOption } from 'src/common/interfaces/general-response.interface';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAll(dto: SearchRoleDto): Promise<Role[]> {
    const { filter, order_by, sort } = dto;

    const query = this.dataSource
      .createQueryBuilder()
      .select(['role.id', 'role.name'])
      .from(Role, 'role');

    // Add WHERE filter
    if (filter?.name) {
      query.where('role.name LIKE :name', { name: `%${filter.name}%` });
    }

    // Add ORDER BY
    if (order_by) {
      query.orderBy(`role.${order_by}`, sort === 'DESC' ? 'DESC' : 'ASC');
    } else {
      query.orderBy('role.id', 'ASC'); // default
    }

    // Run the query
    return await query.getMany();
  }

  async getOptions(): Promise<TSelectOption<number>[]> {
    const roles = await this.dataSource
      .createQueryBuilder()
      .select(['role.id AS value', 'role.name AS label'])
      .from(Role, 'role')
      .orderBy('role.name', 'ASC')
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

  async update(id: number, dto: UpdateRoleDto) {
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
