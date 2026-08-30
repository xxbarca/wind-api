import * as fs from 'node:fs';
import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { MYSQL } from '@/modules/Config/constants';
function getEnv(env: string): Record<string, unknown> {
  if (fs.existsSync(env)) {
    return dotenv.parse(fs.readFileSync(env));
  }
  return {};
}

function buildConnectOptions() {
  const defaultConfig = getEnv('.env');
  const envConfig = getEnv(`.env.${process.env.NODE_ENV || 'production'}`);
  const config = { ...defaultConfig, ...envConfig };
  return {
    type: config[MYSQL.TYPE],
    host: config[MYSQL.HOST],
    port: config[MYSQL.PORT],
    username: config[MYSQL.USERNAME],
    password: config[MYSQL.PASSWORD],
    database: config[MYSQL.DATABASE],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [__dirname + '/**/*.entity.{js,ts}'],
  } as TypeOrmModuleOptions;
}

export const connectionParams = buildConnectOptions();

export default new DataSource({
  ...connectionParams,
  migrations: ['src/migrations/**'],
  subscribers: [],
} as DataSourceOptions);
