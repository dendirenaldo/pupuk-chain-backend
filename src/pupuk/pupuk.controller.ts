import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PupukService } from './pupuk.service';
import { QueryPupukDto, InsertPupukDto, UpdatePupukDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleType } from 'src/general/role.type';

@ApiBearerAuth()
@ApiTags('Pupuk')
@Controller('pupuk')
export class PupukController {
    constructor(private pupukService: PupukService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll(@Query() query: QueryPupukDto) {
        return this.pupukService.findAll(query);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.pupukService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch()
    create(@Body() data: InsertPupukDto, @Req() { user }: any) {
        if (user.role === RoleType.ADMIN) {
            return this.pupukService.create(data);
        } else {
            throw new ForbiddenException('Only administrator can access this endpoint.')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdatePupukDto, @Req() { user }: any) {
        if (user.role === RoleType.ADMIN) {
            return this.pupukService.update(+id, data);
        } else {
            throw new ForbiddenException('Only administrator can access this endpoint.')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    delete(@Param('id') id: string, @Req() { user }: any) {
        if (user.role === RoleType.ADMIN) {
            return this.pupukService.delete(+id);
        } else {
            throw new ForbiddenException('Only administrator can access this endpoint.')
        }
    }
}
