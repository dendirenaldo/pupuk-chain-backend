import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BlockchainService } from './blockchain.service';

@ApiTags('Blockchain')
@Controller('blockchain')
export class BlockchainController {
    constructor(private blockchainService: BlockchainService) { }

    @Get(':transactionHash')
    getTransaction(@Param('transactionHash') transactionHash: string) {
        return this.blockchainService.getTransaction(transactionHash);
    }
}
