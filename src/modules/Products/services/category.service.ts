import { Injectable } from '@nestjs/common';
import { BaseService } from '@/common/bases';
import { CategoryEntity } from '@/modules/Products/entities';
import { CategoryRepository } from '@/modules/Products/repositories';
import { CreateCategoryDto } from '@/modules/Products/dtos';

@Injectable()
export class CategoryService extends BaseService<
  CategoryEntity,
  CategoryRepository
> {
  constructor(protected repository: CategoryRepository) {
    super(repository);
  }
}
