import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CategoryService } from '@/modules/Products/services';
import { CreateCategoryDto, UpdateCategoryDto } from '@/modules/Products/dtos';
import { omit } from 'lodash';

@Controller('category')
export class CategoryController {
  constructor(private service: CategoryService) {}

  @Post()
  public async create(@Body() data: CreateCategoryDto) {
    return await this.service.create(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch()
  update(@Body() data: UpdateCategoryDto) {
    return this.service.update(data.id, { ...omit(data, 'id') });
  }
}
