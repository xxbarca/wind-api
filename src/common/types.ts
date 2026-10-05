import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export type ServiceListQueryOption = Record<string, any>;

export type QueryHook<Entity extends ObjectLiteral> = (
  qb: SelectQueryBuilder<Entity>,
) => Promise<SelectQueryBuilder<Entity>>;

/**
 * 分页选项
 * */
export interface PaginateOptions {
  /**
   * 当前页数
   * */
  pageNo?: number;
  /**
   * 每页现实数量
   * */
  pageSize?: number;
}
