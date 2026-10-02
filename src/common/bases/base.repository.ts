import {
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { NotFoundException } from '@nestjs/common';

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
}
