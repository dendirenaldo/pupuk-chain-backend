import { Module } from '@nestjs/common';
import { TransaksiController } from './transaksi.controller';
import { TransaksiService } from './transaksi.service';
import { providers } from 'ethers';
import { PengedarProvider } from 'src/pengedar/pengedar.provider';
import { UserProvider } from 'src/user/user.provider';
import { PupukProvider } from 'src/pupuk/pupuk.provider';

@Module({
  controllers: [TransaksiController],
  providers: [TransaksiService, ...PengedarProvider, ...UserProvider, ...PupukProvider, providers.InfuraProvider, providers.JsonRpcProvider]
})
export class TransaksiModule { }
