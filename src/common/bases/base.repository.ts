import {
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { OnlineStatus } from '@/modules/Products/constants';
import { PaginateOptions } from '@/common/types';
import { isNil } from 'lodash';

/** 列表查询条件 */
export interface ListQuery<T extends ObjectLiteral> {
  /** 查询别名，如 's' */
  alias: string;
  /** 等值条件对象 */
  where?: FindOptionsWhere<T>;
  /** 关键字（配合 keywordFields 生成 OR 模糊匹配） */
  keyword?: string;
  /** 关键字匹配字段，写完整 SQL 表达式，如 'LOWER(s.name)' */
  keywordFields?: string[];
  /** 需要 leftJoinAndSelect 的关联，如 ['skus'] */
  relations?: string[];
  /** 自定义条件（在等值与关键字之后追加） */
  apply?: (qb: SelectQueryBuilder<T>) => void;
  /** 排序，如 { 'p.id': 'ASC' } */
  order?: Record<string, 'ASC' | 'DESC'>;
  /** 限制条数 */
  take?: number;
}

/** 分页查询条件 */
export interface PageQuery<T extends ObjectLiteral> extends ListQuery<T> {
  pageNo?: number;
  pageSize?: number;
  /** 每页默认条数（未传 pageSize 时生效，默认 10） */
  defaultPageSize?: number;
}

export abstract class BaseRepository<
  E extends ObjectLiteral,
> extends Repository<E> {
  /**
   * 构建查询时默认的模型对应的查询名称
   */
  protected abstract _qbName: string;

  /**
   * 返回查询器名称
   */
  get qbName(): string {
    return this._qbName;
  }

  /**
   * 构建基础查询器
   */
  buildQuery(): SelectQueryBuilder<E> {
    return this.createQueryBuilder(this.qbName);
  }

  async findByIdOrFail(id: string) {
    const entity = await this.findOne({
      where: { id } as unknown as FindOptionsWhere<E>,
    });
    if (!entity) throw new NotFoundException('该条数据不存在');
    return entity;
  }

  /**
   * 状态切换
   * */
  async toggleStatus(id: string, field: string = 'status') {
    const entity = await this.findByIdOrFail(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const current = (entity as any)[field];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (entity as any)[field] =
      current === OnlineStatus.ONLINE
        ? OnlineStatus.OFFLINE
        : OnlineStatus.ONLINE;
    return this.save(entity);
  }

  /**
   * 分页
   * */
  async pageBy(qb: SelectQueryBuilder<E>, options: PaginateOptions) {
    const limit =
      isNil(options.pageSize) || options.pageSize < 1 ? 1 : options.pageSize;
    const page =
      isNil(options.pageNo) || options.pageNo < 1 ? 1 : options.pageNo;
    const start = page >= 1 ? page - 1 : 0;
    const totalItems = await qb.getCount();
    qb.take(limit).skip(start * limit);
    const items = await qb.getMany();
    const totalPages =
      totalItems % limit === 0
        ? Math.floor(totalItems / limit)
        : Math.floor(totalItems / limit) + 1;
    const remainder = totalItems % limit !== 0 ? totalItems % limit : limit;
    const itemCount = page < totalPages ? limit : remainder;
    return {
      items,
      meta: {
        total: totalItems,
        itemCount,
        pageSize: limit,
        totalPages,
        pageNo: page,
      },
    };
  }
}
