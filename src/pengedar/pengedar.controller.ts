import { Body, Controller, Delete, FileTypeValidator, ForbiddenException, Get, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { PengedarService } from './pengedar.service';
import { QueryPengedarDto, InsertPengedarDto, UpdatePengedarDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleType } from 'src/general/role.type';
import * as path from 'path';
import * as fs from 'fs';
import { Observable, of } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiBearerAuth()
@ApiTags('Pengedar')
@Controller('pengedar')
export class PengedarController {
    constructor(private pengedarService: PengedarService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll(@Query() query: QueryPengedarDto) {
        return this.pengedarService.findAll(query);
    }

    @Get('/kop/:filename')
    getKop(@Param('filename') filename: string, @Res() res): Observable<Object> {
        let directory = path.join(process.cwd(), 'uploads/kop/' + filename);
        if (!fs.existsSync(directory)) directory = path.join(process.cwd(), 'uploads/kop/default_kop.jpg');
        return of(res.sendFile(directory));
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.pengedarService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('picture', {
        storage: diskStorage({
            destination: './uploads/kop',
            filename: (req, file, callback) => {
                const uniqueSuffix =
                    Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = path.extname(file.originalname);
                const filename = `${file.originalname} - ${uniqueSuffix}${ext}`;
                callback(null, filename);
            },
        })
    }))
    @ApiConsumes('multipart/form-data')
    @Patch()
    create(@Body() data: InsertPengedarDto, @Req() { user }: any, @UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 10240000 }),
            new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: true
    })) picture: Express.Multer.File) {
        if (user.role === RoleType.ADMIN) {
            return this.pengedarService.create(data, picture.filename);
        } else {
            throw new ForbiddenException('Only administrator can access this endpoint.')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('picture', {
        storage: diskStorage({
            destination: './uploads/kop',
            filename: (req, file, callback) => {
                const uniqueSuffix =
                    Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = path.extname(file.originalname);
                const filename = `${file.originalname} - ${uniqueSuffix}${ext}`;
                callback(null, filename);
            },
        })
    }))
    @ApiConsumes('multipart/form-data')
    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdatePengedarDto, @Req() { user }: any, @UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 10240000 }),
            new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: false
    })) picture?: Express.Multer.File) {
        if (user.role === RoleType.ADMIN) {
            return this.pengedarService.update(+id, data, picture?.filename);
        } else {
            throw new ForbiddenException('Only administrator can access this endpoint.')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    delete(@Param('id') id: string, @Req() { user }: any) {
        if (user.role === RoleType.ADMIN) {
            return this.pengedarService.delete(+id);
        } else {
            throw new ForbiddenException('Only administrator can access this endpoint.')
        }
    }
}
