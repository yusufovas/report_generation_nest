import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportModule } from './report/report.module';
import { Report } from './report/report.entity';

@Module({
  imports: [ReportModule, TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'report',
    entities: [Report],
    synchronize: false,
    autoLoadEntities: true
  })],
})
export class AppModule {}
