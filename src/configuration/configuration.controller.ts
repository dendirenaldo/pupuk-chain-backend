import { Body, Controller, Delete, ForbiddenException, Get, HttpStatus, Param, ParseFilePipeBuilder, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UpsertConfigurationDto, QueryConfigurationDto, UpsertConfigurationImageDto } from './dto';
import { ConfigurationService } from './configuration.service';
import { extname } from 'path';
import { Observable, of } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { RoleType } from 'src/general/role.type';

@ApiBearerAuth()
@ApiTags('Configuration')
@Controller('configuration')
export class ConfigurationController {
    constructor(private configurationService: ConfigurationService) { }

    @Get()
    findAll(@Query() query: QueryConfigurationDto) {
        return this.configurationService.findAll(query)
    }

    @Get('image/:filename')
    getGambar(@Param('filename') filename: string, @Res() res): Observable<Object> {
        let directory = path.join(process.cwd(), 'uploads/configuration/' + filename);
        if (!fs.existsSync(directory)) directory = path.join(process.cwd(), 'uploads/error.png');
        return of(res.sendFile(directory));
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    upsert(@Body() data: UpsertConfigurationDto, @Req() { user }: any) {
        if (user.role === RoleType.ADMIN) {
            return this.configurationService.upsert(data);
        } else {
            throw new ForbiddenException('This endpoint only accessible for administrator only')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: './uploads/configuration',
            filename: (req, file, callback) => {
                const uniqueSuffix =
                    Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                const filename = `${uniqueSuffix}${ext}`;
                callback(null, filename);
            },
        }),
    }))
    @ApiConsumes('multipart/form-data')
    @Post('image')
    updateGambar(@Body() data: UpsertConfigurationImageDto, @UploadedFile(
        new ParseFilePipeBuilder()
            .addFileTypeValidator({
                fileType: /(jpg|jpeg|png|gif)$/,
            })
            .addMaxSizeValidator({
                maxSize: 2048000
            })
            .build({
                errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            })) image: Express.Multer.File, @Req() { user }: any) {
        if (user.role === RoleType.ADMIN) {
            return this.configurationService.upsertGambar(image.filename, data);
        } else {
            throw new ForbiddenException('This endpoint only accessible for administrator only')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':nama')
    delete(@Param('nama') nama: string, @Req() { user }: any) {
        if (user.role === RoleType.ADMIN) {
            return this.configurationService.delete(nama);
        } else {
            throw new ForbiddenException('This endpoint only accessible for administrator only')
        }
    }
}
