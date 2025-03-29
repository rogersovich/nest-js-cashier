// src/raw/base-raw.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class BaseRawService {
  constructor(private readonly dataSource: DataSource) {}

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return this.dataSource.query(sql, params);
  }

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const result = await this.dataSource.query(sql, params);
    return (result[0] as T) ?? null;
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
      if (value !== undefined && value !== null) {
        if (typeof value === 'string') {
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
