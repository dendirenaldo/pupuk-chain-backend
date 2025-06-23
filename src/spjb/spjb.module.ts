import { Module } from '@nestjs/common';
import { SpjbController } from './spjb.controller';
import { SpjbService } from './spjb.service';
import { providers } from 'ethers';
import { PengedarProvider } from 'src/pengedar/pengedar.provider';
import { PupukProvider } from 'src/pupuk/pupuk.provider';

@Module({
  controllers: [SpjbController],
  providers: [SpjbService, ...PengedarProvider, ...PupukProvider, providers.InfuraProvider, providers.JsonRpcProvider]
})
export class SpjbModule { }
