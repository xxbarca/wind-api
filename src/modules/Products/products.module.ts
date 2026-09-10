import { Module } from '@nestjs/common';
import * as controllers from '@/modules/Products/controllers';
import * as services from '@/modules/Products/services';
import * as repositories from '@/modules/Products/repositories';
@Module({
  controllers: Object.values(controllers),
  providers: [...Object.values(services), ...Object.values(repositories)],
})
export class ProductsModule {}
