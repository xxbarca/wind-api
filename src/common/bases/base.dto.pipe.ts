import {
  ArgumentMetadata,
  Injectable,
  Type,
  ValidationPipe,
} from '@nestjs/common';
import { VALIDATION_PIPE_OPTIONS } from '@/common/validation';

/**
 * 参数级 DTO 校验管道。
 *
 * 为什么需要它：继承自 `CrudController` 的通用路由在运行时拿不到泛型 DTO 类型，
 * Nest 从 `design:paramtypes` 只能读到 Object。这里由调用方显式传入 DTO 类，
 * 使继承来的路由也能完成与普通控制器完全一致的校验与类型转换。
 *
 * 用法：`@Body(new BaseDtoPipe(CreateStoreDto)) dto: any`
 */
@Injectable()
export class BaseDtoPipe extends ValidationPipe {
  constructor(private readonly dto?: any) {
    super(VALIDATION_PIPE_OPTIONS);
  }

  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    if (!this.dto) return value;
    return super.transform(value, { ...metadata, metatype: this.dto });
  }
}
