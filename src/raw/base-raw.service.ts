// src/raw/base-raw.service.ts
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class BaseRawService {
  constructor(private readonly dataSource: DataSource) {}

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      return await this.dataSource.query(sql, params);
    } catch (error) {
      console.error('❌ RAW SQL Error:', error);

      if (error.name === 'QueryFailedError') {
        throw new BadRequestException('Invalid query: ' + error.message);
      }

      throw new InternalServerErrorException('Failed to execute query');
    }
  }

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    try {
      const result = await this.dataSource.query(sql, params);
      return (result[0] as T) ?? null;
    } catch (error: any) {
      console.error('❌ RAW SQL ERROR:', error);

      if (error.name === 'QueryFailedError') {
        throw new BadRequestException(`Invalid SQL Query: ${error.message}`);
      }

      throw new InternalServerErrorException('Unexpected server error.');
    }
  }

  buildDynamicWhere(
    filters: Record<string, any>,
    columns: string[],
  ): {
    whereClause: string;
    params: any[];
  } {
    const where: string[] = [];
    const params: any[] = [];

    for (const key of columns) {
      const value = filters[key];
      if (value !== undefined) {
        if (value === null) {
          where.push(`${key} IS NULL`);
        } else if (value === '__NOT_NULL__') {
          where.push(`${key} IS NOT NULL`);
        } else if (typeof value === 'string') {
          where.push(`${key} LIKE ?`);
          params.push(`%${value}%`);
        } else {
          where.push(`${key} = ?`);
          params.push(value);
        }
      }
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    return { whereClause, params };
  }

  buildPaginationAndSort(
    orderBy: string,
    sort: 'ASC' | 'DESC',
    page = 1,
    limit = 10,
    allowedColumns: string[] = ['id'],
  ): {
    clause: string;
    params: any[];
  } {
    const offset = (page - 1) * limit;
    const safeOrderBy = allowedColumns.includes(orderBy) ? orderBy : 'id';
    const safeSort = sort === 'DESC' ? 'DESC' : 'ASC';

    return {
      clause: `ORDER BY ${safeOrderBy} ${safeSort} LIMIT ? OFFSET ?`,
      params: [limit, offset],
    };
  }
}
