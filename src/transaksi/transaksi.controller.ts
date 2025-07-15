import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransaksiService } from './transaksi.service';
import { GetFlowByFertilizerDto, InsertTransaksiDto, QueryTransaksiDto } from './dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Transaksi')
@ApiBearerAuth()
@Controller('transaksi')
export class TransaksiController {
    constructor(private transaksiService: TransaksiService) { }

    @Get()
    findAll(@Query() query: QueryTransaksiDto) {
        return this.transaksiService.findAll(query);
    }

    @Get('/pupuk')
    getFlowByFertilizer(@Query() query: GetFlowByFertilizerDto) {
        return this.transaksiService.getFlowByFertilizer(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.transaksiService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch()
    create(@Body() data: InsertTransaksiDto) {
        return this.transaksiService.create(data);
    }
}
