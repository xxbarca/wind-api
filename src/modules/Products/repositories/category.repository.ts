import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@/common/bases';
import { CategoryEntity } from '@/modules/Products/entities';
import { DataSource } from 'typeorm';

@Injectable()
export class CategoryRepository extends BaseRepository<CategoryEntity> {
  protected _qbName: string = 'category';
  constructor(protected dataSource: DataSource) {
    super(CategoryEntity, dataSource.createEntityManager());
  }
}
