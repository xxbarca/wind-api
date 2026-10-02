import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/modules/Database/database.module';
import { ProductsModule } from '@/modules/Products/products.module';

@Module({
  imports: [DatabaseModule, ProductsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
