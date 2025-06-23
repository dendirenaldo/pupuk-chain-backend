import { Body, Controller, Delete, FileTypeValidator, ForbiddenException, Get, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Post, Put, Query, Render, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { MailService } from 'src/mail/mail.service';
import { UserService } from './user.service';
import { ChangePasswordDto, ChangeProfileDto, ChangeProfilePictureDto, CheckResetPasswordTokenDto, CreateUserDto, LoginDto, RegisterDto, RequestResetPasswordDto, ResetPasswordDto, UpdateUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleType } from 'src/general/role.type';
import { QueryUserDto } from './dto/query-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Observable, of } from 'rxjs';

@ApiBearerAuth()
@ApiTags('Authentication')
@Controller('user')
export class UserController {
    constructor(private userService: UserService, private mailService: MailService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll(@Query() query: QueryUserDto, @Req() { user }: any) {
        if (user.role === RoleType.ADMIN) {
            return this.userService.findAll(query);
        } else {
            throw new ForbiddenException('Only administrator can access this endpoint.')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    me(@Req() { user }: any) {
        return this.userService.me(+user.id);
    }

    @Render('account-activation.hbs')
    @Get('email-verification/:token')
    emailVerificationAction(@Param('token') token: any) {
        return this.userService.emailVerificationAction(+token);
    }

    @Get('/profile-picture/:filename')
    getProfilePicture(@Param('filename') filename: string, @Res() res): Observable<Object> {
        let directory = path.join(process.cwd(), 'uploads/profile-picture/' + filename);
        if (!fs.existsSync(directory)) directory = path.join(process.cwd(), 'uploads/error.png');
        return of(res.sendFile(directory));
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string, @Req() { user }: any) {
        if (user.role === RoleType.ADMIN) {
            return this.userService.findOne(+id);
        } else {
            throw new ForbiddenException('Only administrator can access this endpoint.')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('email-verification')
    emailVerification(@Req() { user }: any) {
        return this.userService.emailVerification(user);
    }

    @Post('login')
    login(@Body() data: LoginDto) {
        return this.userService.login(data);
    }

    @Patch('register')
    register(@Body() data: RegisterDto) {
        return this.userService.register(data);
    }

    @Post('reset-password')
    resetPassword(@Req() req: any, @Body() data: ResetPasswordDto) {
        return this.mailService.sendResetPassword(data.email, req.protocol, req.get('Host'));
    }

    @Post('check-reset-password-token')
    checkResetPasswordToken(@Body() data: CheckResetPasswordTokenDto) {
        return this.userService.checkResetPasswordToken(data);
    }

    @Put('reset-password')
    requestResetPassword(@Body() data: RequestResetPasswordDto) {
        return this.userService.requestResetPassword(data);
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('picture', {
        storage: diskStorage({
            destination: './uploads/profile-picture',
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
    create(@Body() data: CreateUserDto, @Req() { user }: any, @UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 10240000 }),
            new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: false
    })) picture?: Express.Multer.File) {
        if (user.role === RoleType.ADMIN) {
            return this.userService.create(data, picture?.filename);
        } else {
            throw new ForbiddenException('Only administrator can access this endpoint.')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('change-password')
    changePassword(@Body() data: ChangePasswordDto, @Req() { user }: any) {
        return this.userService.changePassword(data, +user.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('change-profile')
    changeProfile(@Body() data: ChangeProfileDto, @Req() { user }: any) {
        return this.userService.changeProfile(data, +user.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('picture', {
        storage: diskStorage({
            destination: './uploads/profile-picture',
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
    @Put('change-profile-picture')
    async changeProfilePicture(@Body() _: ChangeProfilePictureDto, @UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 10240000 }),
            new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: true
    })) picture: Express.Multer.File, @Req() { user }: any) {
        return this.userService.changeProfilePicture(+user.id, picture.filename);
    }

    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('picture', {
        storage: diskStorage({
            destination: './uploads/profile-picture',
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
    update(@Param('id') id: string, @Body() data: UpdateUserDto, @Req() { user }: any, @UploadedFile(new ParseFilePipe({
        validators: [
            new MaxFileSizeValidator({ maxSize: 10240000 }),
            new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: false
    })) picture?: Express.Multer.File) {
        if (user.role === RoleType.ADMIN) {
            return this.userService.update(+id, data, picture?.filename);
        } else {
            throw new ForbiddenException('Only administrator can access this endpoint.')
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    delete(@Param('id') id: string, @Req() { user }: any) {
        if (user.role === RoleType.ADMIN) {
            return this.userService.delete(+id);
        } else {
            throw new ForbiddenException('Only administrator can access this endpoint.')
        }
    }
}
