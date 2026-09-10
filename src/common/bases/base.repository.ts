import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

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
  queryBuilder(): SelectQueryBuilder<E> {
    return this.createQueryBuilder(this.qbName);
  }
}
