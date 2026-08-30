import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { connectionParams } from '@/data-source';

@Module({
  imports: [TypeOrmModule.forRoot(connectionParams)],
})
export class DatabaseModule {}
