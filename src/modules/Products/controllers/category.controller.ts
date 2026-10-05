import { Body, Controller, Post } from '@nestjs/common';
import { CategoryService } from '@/modules/Products/services';
import { CreateCategoryDto, UpdateCategoryDto } from '@/modules/Products/dtos';
import { BaseController } from '@/common/bases';

@Controller('category')
export class CategoryController extends BaseController({
  updateDto: UpdateCategoryDto,
  createDto: CreateCategoryDto,
}) {
  constructor(service: CategoryService) {
    super(service);
  }
}
