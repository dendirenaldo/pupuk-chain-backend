import { BadRequestException, ForbiddenException, Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { ChangePasswordDto, ChangeProfileDto, CheckResetPasswordTokenDto, CreateUserDto, LoginDto, RegisterDto, RequestResetPasswordDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcrypt'
import { ResetPassword } from './reset-password.entity';
import { MailService } from 'src/mail/mail.service';
import { QueryUserDto } from './dto/query-user.dto';
import { FindAllUserInterface } from './interface';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { RoleType } from 'src/general/role.type';
import * as fs from 'fs';
import { Pengedar } from 'src/pengedar/pengedar.entity';

@Injectable()
export class UserService {
    constructor(
        @Inject('USER_REPOSITORY')
        private userRepository: typeof User,

        @Inject('RESET_PASSWORD_REPOSITORY')
        private resetPasswordRepository: typeof ResetPassword,

        private jwt: JwtService,

        private config: ConfigService,

        private mailService: MailService,
    ) { }

    async signToken(userId: number, email: string): Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            email
        }
        const token = await this.jwt.signAsync(
            payload,
            {
                expiresIn: '30d',
                secret: this.config.get<string>('JWT_SECRET')
            }
        )
        return {
            access_token: token
        }
    }

    async findAll(query: QueryUserDto): Promise<FindAllUserInterface> {
        const user = await this.userRepository.findAll({
            attributes: {
                exclude: ['password']
            },
            ...(query?.offset && { offset: query?.offset }),
            ...(query?.limit && { limit: query?.limit }),
            ...(query.order ? {
                order: [[Array.isArray(query.order.index) ? Sequelize.col(query.order.index.join('.')) : query.order.index, query.order.order]]
            } : {
                order: [['createdAt', 'DESC']]
            }),
            where: {
                ...(query.role && {
                    role: query.role,
                }),
                ...(query.search && {
                    [Op.or]: [{
                        fullName: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        email: {
                            [Op.like]: `%${query.search}%`
                        },
                    }]
                })
            }
        })
        const totalData = await this.userRepository.count({
            attributes: {
                exclude: ['password']
            },
            where: {
                ...(query.role && {
                    role: query.role,
                }),
                ...(query.search && {
                    [Op.or]: [{
                        fullName: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        email: {
                            [Op.like]: `%${query.search}%`
                        },
                    }]
                })
            }
        })
        return {
            data: user,
            totalData: totalData,
            totalRow: user.length
        }
    }

    async me(userId: number) {
        const user = await this.userRepository.findByPk(userId, {
            attributes: {
                exclude: ['password']
            },
            include: [{
                model: Pengedar,
                as: 'pengedar',
                required: false
            }]
        });
        return user;
    }

    async emailVerificationAction(token: number) {
        const user: User = await this.userRepository.findOne({
            attributes: ['id', 'fullName', 'email', 'isActive'],
            where: { verificationCode: token }
        });

        if (!user) return {
            statusCode: 422,
            message: 'Account not found',
            error: 'Unprocessable Content',
        }
        await this.userRepository.update({
            isActive: true
        }, { where: { id: user.id } })
        return {
            statusCode: 201,
            data: user,
            message: 'Your account is activated. Now you can login with your own account!',
        }
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            attributes: {
                exclude: ['password']
            },
            where: { id }
        });

        if (!user) throw new UnprocessableEntityException('User not found');

        return user;
    }

    async emailVerification(account: any) {
        return await this.mailService.sendEmailConfirmation(account.email);
    }

    async login(data: LoginDto): Promise<{ access_token: string }> {
        const user: User = await this.userRepository.findOne({
            where: {
                email: data.email
            }
        })

        if (!user) throw new ForbiddenException('Credentials incorrect')

        if (bcrypt.compareSync(data.password, user.password)) {
            if (user.role !== RoleType.ADMIN && user.isActive === false) throw new ForbiddenException('Your account is not activated')
            return this.signToken(user.id, user.email)
        } else {
            throw new ForbiddenException('Credentials incorrect')
        }
    }

    async register(data: RegisterDto) {
        const salt = bcrypt.genSaltSync(+this.config.get<number>('SALT_ROUND'));
        const password_hash = bcrypt.hashSync(data?.password ? data.password : '12345678', salt)

        try {
            const user: User = await this.userRepository.create({
                ...data,
                password: password_hash,
                role: RoleType.PETANI
            })
            delete user.password;
            await this.mailService.sendEmailConfirmation(user.email);
            return user
        } catch (err) {
            const errors = err.errors.map((val) => ({
                [val.path]: val.message
            }));

            if (err.name === 'SequelizeUniqueConstraintError') throw new BadRequestException({
                statusCode: 400,
                ...errors.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
                error: 'Bad Request',

            })
        }
    }

    async checkResetPasswordToken(data: CheckResetPasswordTokenDto) {
        const resetPassword = await this.resetPasswordRepository.findOne({
            where: {
                uniqueCode: data.token,
                '$user.email$': data.email
            },
            include: {
                model: User,
                as: 'user'
            }
        });

        if (!resetPassword) throw new ForbiddenException('Credentials incorrect')

        return resetPassword
    }

    async create(data: CreateUserDto, pictureFilename?: Express.Multer.File['filename']): Promise<User> {
        const { password, picture, ...filteredData } = data;
        const salt = bcrypt.genSaltSync(+this.config.get<number>('SALT_ROUND'));
        const password_hash = bcrypt.hashSync(data?.password ? password : '12345678', salt);

        try {
            if ((data.role === RoleType.DISTRIBUTOR || data.role === RoleType.PENGECER) && !data?.pengedarId) throw new BadRequestException({
                statusCode: 400,
                pengecerId: `pengecerId shouldn't be empty`,
                error: 'Bad Request',
            })
            const user: User = await this.userRepository.create({
                ...filteredData,
                password: password_hash,
                ...((typeof pictureFilename !== 'undefined' && pictureFilename !== null && pictureFilename !== '') && { picture: pictureFilename }),
            })
            delete user.password;
            if (user.isActive === false) await this.mailService.sendEmailConfirmation(user.email);
            return user
        } catch (err) {
            const errors = err.errors.map((val) => ({
                [val.path]: val.message
            }));

            if (err.name === 'SequelizeUniqueConstraintError') throw new BadRequestException({
                statusCode: 400,
                ...errors.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
                error: 'Bad Request',

            })
        }
    }

    async changeProfilePicture(userId: number, pictureFilename: Express.Multer.File['filename']) {
        const user = await this.findOne(userId);
        if (user.picture !== 'default.png') fs.unlinkSync(`uploads/profile-picture/${user.picture}`);
        return await this.userRepository.update({ picture: pictureFilename }, { where: { id: userId } }).then(async () => await this.userRepository.findByPk(userId));
    }

    async update(id: number, data: UpdateUserDto, pictureFilename?: Express.Multer.File['filename']): Promise<User> {
        const { password, picture, ...filteredData } = data;
        let password_hash = '';

        if (data.password !== null && data.password !== '') {
            const salt = bcrypt.genSaltSync(+this.config.get<number>('SALT_ROUND'));
            password_hash = bcrypt.hashSync(password, salt);
        }

        if ((data.role === RoleType.DISTRIBUTOR || data.role === RoleType.PENGECER) && !data?.pengedarId) throw new BadRequestException({
            statusCode: 400,
            pengedar: `pengedar shouldn't be empty`,
            error: 'Bad Request',
        })
        const user: User = await this.findOne(id);

        try {
            const userUpdated: User = await this.userRepository.update({
                ...filteredData,
                ...(data.password !== null && data.password !== '' && { password: password_hash }),
                ...((typeof pictureFilename !== 'undefined' && pictureFilename !== null && pictureFilename !== '') && { picture: pictureFilename }),
            }, { where: { id } }).then(async (res) => await this.findOne(id));
            if (typeof pictureFilename !== 'undefined' && pictureFilename !== null && pictureFilename !== '' && user.picture !== 'default.png') fs.unlinkSync(`uploads/profile-picture/${user.picture}`);
            delete userUpdated.password;
            if (userUpdated.isActive === false) await this.mailService.sendEmailConfirmation(userUpdated.email);
            return user;
        } catch (err) {
            console.log(err)
            const errors = err.errors.map((val) => ({
                [val.path]: val.message
            }));

            if (err.name === 'SequelizeUniqueConstraintError') throw new BadRequestException({
                statusCode: 400,
                ...errors.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
                error: 'Bad Request',

            })
        }
    }

    async requestResetPassword(data: RequestResetPasswordDto) {
        const resetPassword = await this.resetPasswordRepository.findOne({
            where: {
                uniqueCode: data.token,
                '$user.email$': data.email
            },
            include: {
                model: User,
                as: 'user'
            }
        });

        if (!resetPassword) throw new ForbiddenException('Credentials incorrect')

        if (data.newPassword !== data.newPasswordConfirmation) throw new BadRequestException({
            statusCode: 400,
            error: 'Bad Request',
            newPasswordConfirmation: 'newPasswordConfirmation must be the same as newPassword'
        })

        const salt = bcrypt.genSaltSync(+this.config.get<number>('SALT_ROUND'));
        const password_hash = bcrypt.hashSync(data.newPassword, salt)
        await this.userRepository.update({
            password: password_hash
        }, {
            where: { id: resetPassword.userId }
        })
        await this.resetPasswordRepository.destroy({ where: { uniqueCode: data.token } })
        const user = await this.userRepository.findByPk(resetPassword.userId, { raw: true })
        delete user.password
        return user
    }

    async changeProfile(data: ChangeProfileDto, userId: number): Promise<User> {
        return await this.userRepository.update(data, { where: { id: userId } }).then(async () => await this.findOne(userId));
    }

    async changePassword(data: ChangePasswordDto, userId: number): Promise<User> {
        if (data.newPassword != data.newPasswordConfirmation) throw new BadRequestException({
            statusCode: 400,
            newPasswordConfirmation: 'newPasswordConfirmation must match with newPassword',
            error: 'Bad Request'
        })

        const userData = await this.findOne(userId)

        if (!(await bcrypt.compare(data.oldPassword, userData.password))) throw new BadRequestException({
            statusCode: 400,
            oldPassword: 'oldPassword is invalid',
            error: 'Bad Request'
        })

        const salt = bcrypt.genSaltSync(+this.config.get<number>('SALT_ROUND'));
        const password_hash = bcrypt.hashSync(data.newPassword, salt);
        return await this.userRepository.update({ password: password_hash }, { where: { id: userId } }).then(() => userData);
    }

    async delete(id: number): Promise<User> {
        const user = await this.findOne(id);
        return await this.userRepository.destroy({ where: { id } }).then((_) => user);
    }
}
