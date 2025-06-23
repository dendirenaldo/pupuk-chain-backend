import { Module } from '@nestjs/common';
import { WilayahController } from './wilayah.controller';
import { WilayahService } from './wilayah.service';
import { WilayahProvider } from './wilayah.provider';

@Module({
  controllers: [WilayahController],
  providers: [WilayahService, ...WilayahProvider]
})
export class WilayahModule { }
