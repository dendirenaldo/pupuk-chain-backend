import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/user.entity';
import { ResetPassword } from 'src/user/reset-password.entity';
import { ValidationAttempt } from 'src/user/validation-attempt.entity';

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,

        @Inject('USER_REPOSITORY')
        private userRepository: typeof User,

        @Inject('RESET_PASSWORD_REPOSITORY')
        private resetPasswordRepository: typeof ResetPassword,

        @Inject('VALIDATION_ATTEMPT_REPOSITORY')
        private validationAttemptRepository: typeof ValidationAttempt,

        private configService: ConfigService,
    ) { }

    async sendEmailConfirmation(email: string) {
        const user: User = await this.userRepository.findOne({
            attributes: ['id', 'fullName', 'email', 'verificationCode', 'isActive'],
            include: [{
                model: ValidationAttempt,
                as: 'validationAttempt'
            }],
            where: { email: email }
        })

        if (!user) throw new UnprocessableEntityException('User not found')

        let token = 0

        if (user && user.isActive === true) {
            throw new UnprocessableEntityException('Your account is already activated!');
        } else if (user && user.verificationCode) {
            if (user.validationAttempt.length > 0) {
                const currentTime = new Date().getTime() + (7 * 60 * 60 * 1000);
                const lastTime = new Date(user.validationAttempt[user.validationAttempt.length - 1].createdAt).getTime();

                if ((currentTime - lastTime) < (2 * 60 * 1000)) throw new BadRequestException({
                    statusCode: 400,
                    email: 'The email has requested to activate this account. Please wait up to 2 minutes',
                    remaining: (2 * 60 * 1000) - (currentTime - lastTime),
                    error: 'Bad Request'
                })
            }

            token = user.verificationCode;
            await this.validationAttemptRepository.create({ emailVerification: token })
        } else {
            token = await this.generateUniqueCode(20);
            await this.userRepository.update({
                verificationCode: token,
            }, { where: { email } });
            await this.validationAttemptRepository.create({ emailVerification: token })
        }

        const url = `${this.configService.get<string>('PRODUCTION') === 'true' ? 'https://backend.calegmu.com' : 'http://localhost:3000'}/account/email-verification/${token}`;
        return await this.mailerService.sendMail({
            to: user.email,
            from: `"${this.configService.get<string>('MAIL_NAME')}" <${this.configService.get<string>('MAIL_USER')}>`,
            subject: 'Account Activation | COMNETS RG',
            template: './email_verification',
            context: {
                name: user.fullName,
                token,
                url,
            },
        });
    }

    async sendResetPassword(email: string, protocol: string, host: string) {
        // const url = `${protocol}://${host}/reset_password?token=${token}`;
        const user: User = await this.userRepository.findOne({
            attributes: ['id', 'fullName', 'email', 'verificationCode', 'isActive'],
            where: { email: email }
        })

        if (!user) throw new BadRequestException({
            statusCode: 400,
            email: 'email doesn\'t registered!',
            error: 'Bad Request'
        })

        const resetData: ResetPassword = await this.resetPasswordRepository.findOne({
            include: [{
                model: ValidationAttempt,
                as: 'validationAttempt'
            }],
            where: { userId: user.id }
        })
        let token: number = 0;

        if (resetData) {
            if (resetData.validationAttempt.length > 0) {
                const currentTime = new Date().getTime() + (7 * 60 * 60 * 1000);
                const lastTime = new Date(resetData.validationAttempt[resetData.validationAttempt.length - 1].createdAt).getTime();

                if ((currentTime - lastTime) < (2 * 60 * 1000)) throw new BadRequestException({
                    statusCode: 400,
                    email: 'The email has requested to reset the password. Please wait up to 2 minutes',
                    remaining: (2 * 60 * 1000) - (currentTime - lastTime),
                    error: 'Bad Request'
                })
            }

            token = resetData.uniqueCode
            await this.validationAttemptRepository.create({ resetVerification: resetData.uniqueCode })
        } else {
            token = await this.generateUniqueCode(6);
            const resetPassword = await this.resetPasswordRepository.create({
                userId: user.id,
                uniqueCode: token
            })
            await this.validationAttemptRepository.create({ resetVerification: resetPassword.uniqueCode })
        }

        const url = `${this.configService.get<string>('PRODUCTION') === 'true' ? 'https://backend.calegmu.com' : 'http://localhost:3000'}/reset_password?token=${token}`;
        return await this.mailerService.sendMail({
            to: user.email,
            from: `"${this.configService.get<string>('MAIL_NAME')}" <${this.configService.get<string>('MAIL_USER')}>`,
            subject: 'Reset Password | COMNETS RG',
            template: './reset-password',
            context: {
                name: user.fullName,
                token,
                url,
            },
        });
    }

    async generateUniqueCode(length: number): Promise<number> {
        var add = 1, max = 12 - add;

        if (length > max) {
            return await this.generateUniqueCode(max) + await this.generateUniqueCode(length - max);
        }

        max = Math.pow(10, length + add);
        var min = max / 10;
        var number = Math.floor(Math.random() * (max - min + 1)) + min;
        const uniqueCode = parseInt(("" + number).substring(add));
        const check = await this.resetPasswordRepository.findOne({ where: { uniqueCode } });

        if (!check) return uniqueCode;
        else return this.generateUniqueCode(length);
    }
}