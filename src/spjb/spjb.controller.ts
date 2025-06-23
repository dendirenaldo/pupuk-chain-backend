import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SpjbService } from './spjb.service';
import { InsertSpjbDto, QuerySpjbDto } from './dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('SPJB')
@ApiBearerAuth()
@Controller('spjb')
export class SpjbController {
    constructor(private spjbService: SpjbService) { }

    @Get()
    findAll(@Query() query: QuerySpjbDto) {
        return this.spjbService.findAll(query);
    }

    @Get(':spjbNumber')
    findOne(@Param('spjbNumber') spjbNumber: string) {
        return this.spjbService.findOne(spjbNumber);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch()
    create(@Body() data: InsertSpjbDto) {
        return this.spjbService.create(data);
    }
}
