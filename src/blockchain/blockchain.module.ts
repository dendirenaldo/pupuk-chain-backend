import { Logger, Module } from '@nestjs/common';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';

@Module({
  controllers: [BlockchainController],
  providers: [BlockchainService, Logger]
})
export class BlockchainModule { }
