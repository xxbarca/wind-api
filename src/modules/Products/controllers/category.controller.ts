import { Body, Controller, Post } from '@nestjs/common';
import { CategoryService } from '@/modules/Products/services';
import {
  CreateCategoryDto,
  PageCategoryDto,
  UpdateCategoryDto,
} from '@/modules/Products/dtos';
import { BaseController } from '@/common/bases';

@Controller('category')
export class CategoryController extends BaseController({
  updateDto: UpdateCategoryDto,
  createDto: CreateCategoryDto,
  queryDto: PageCategoryDto,
}) {
  constructor(service: CategoryService) {
    super(service);
  }
}
