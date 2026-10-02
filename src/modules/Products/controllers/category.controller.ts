import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CategoryService } from '@/modules/Products/services';
import { CreateCategoryDto } from '@/modules/Products/dtos';

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
}
