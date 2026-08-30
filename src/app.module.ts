import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/modules/Database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
