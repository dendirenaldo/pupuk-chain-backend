import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WilayahService } from './wilayah.service';
import { QueryWilayahDto, InsertWilayahDto, UpdateWilayahDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleType } from 'src/general/role.type';

@ApiBearerAuth()
@ApiTags('Wilayah')
@Controller('wilayah')
export class WilayahController {
    constructor(private wilayahService: WilayahService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll(@Query() query: QueryWilayahDto, @Req() { user }: any) {
        return this.wilayahService.findAll(query);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string, @Req() { user }: any) {
        return this.wilayahService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch()
    create(@Body() data: InsertWilayahDto, @Req() { user }: any) {
        if (user.role === RoleType.ADMIN || user.role === RoleType.DISTRIBUTOR || user.role === RoleType.PENGECER) {
            return this.wilayahService.create(data);
        } else {
            throw new ForbiddenException('Only administrator, distributor, or pengecer can access this endpoint.')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdateWilayahDto, @Req() { user }: any) {
        if (user.role === RoleType.ADMIN || user.role === RoleType.DISTRIBUTOR || user.role === RoleType.PENGECER) {
            return this.wilayahService.update(+id, data);
        } else {
            throw new ForbiddenException('Only administrator, distributor, or pengecer can access this endpoint.')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    delete(@Param('id') id: string, @Req() { user }: any) {
        if (user.role === RoleType.ADMIN || user.role === RoleType.DISTRIBUTOR || user.role === RoleType.PENGECER) {
            return this.wilayahService.delete(+id);
        } else {
            throw new ForbiddenException('Only administrator, distributor, or pengecer can access this endpoint.')
        }
    }
}
