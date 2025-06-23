import { Module } from '@nestjs/common';
import { PengedarController } from './pengedar.controller';
import { PengedarService } from './pengedar.service';
import { PengedarProvider } from './pengedar.provider';

@Module({
  controllers: [PengedarController],
  providers: [PengedarService, ...PengedarProvider]
})
export class PengedarModule { }
