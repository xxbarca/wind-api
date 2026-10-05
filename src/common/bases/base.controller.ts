import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Type,
} from '@nestjs/common';
import { BaseService } from '@/common/bases/base.service';
import { omit } from 'lodash';
import { BaseDtoPipe } from '@/common/bases/base.dto.pipe';
/** CRUD 控制器路由开关 */
export interface CrudControllerOptions {
  /** 列表查询 DTO（校验 + 类型转换） */
  queryDto?: Type<unknown>;
  /** 新增 DTO */
  createDto?: Type<unknown>;
  /** 编辑 DTO */
  updateDto?: Type<unknown>;
  /** 列表是否分页：true 走 service.page / false 走 service.list（默认 false） */
  pageable?: boolean;
  /** 是否提供 GET /:id（默认 true） */
  detail?: boolean;
  /** 是否提供 POST /（默认 true） */
  create?: boolean;
  /** 是否提供 PUT /:id（默认 true） */
  update?: boolean;
  /** 是否提供 DELETE /:id（默认 true） */
  remove?: boolean;
  /** 是否提供 PATCH /:id/status（默认 false） */
  toggleStatus?: boolean;
}
export function BaseController(options: CrudControllerOptions = {}) {
  const { createDto, updateDto, queryDto } = options;

  @Controller()
  class CrudBaseController {
    constructor(readonly service: BaseService<any, any, any>) {}

    /**
     * 详情
     * */
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.service.findOne(id);
    }

    /**
     * 更新
     * */
    @Patch()
    update(@Body(new BaseDtoPipe(updateDto)) data: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return this.service.update(data.id, { ...omit(data, 'id') });
    }

    /**
     * 创建
     * */
    @Post()
    public async create(@Body(new BaseDtoPipe(createDto)) data: any) {
      return await this.service.create(data);
    }

    /**
     * 删除
     * */
    @Delete(':id')
    public async delete(@Param('id') id: string) {
      return await this.service.delete(id);
    }

    /**
     * 状态切换
     * */
    @Patch(':id/status')
    public toggleStatus(@Param('id') id: string) {
      return this.service.toggleStatus(id);
    }

    /**
     * 分页
     * */
    @Post('page')
    public async page(@Body(new BaseDtoPipe(queryDto)) data: any) {
      return await this.service.page(data);
    }
  }

  return CrudBaseController;
}
