import { MailerModule } from '@nestjs-modules/mailer';
import { Global, Module } from '@nestjs/common';
import { join } from 'path';
import { MailService } from './mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserProvider } from 'src/user/user.provider';
import { ResetPasswordProvider } from 'src/user/reset-password.provider';
import { ValidationAttemptProvider } from 'src/user/validation-attempt.provider';

@Global()
@Module({
    imports: [
        ConfigModule,
        MailerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                transport: {
                    host: configService.get<string>('MAIL_HOST'),
                    // secure: true,
                    port: +configService.get<number>('MAIL_PORT'),
                    ...(configService.get<string>('MAIL_HOST') === 'smtp.google.com' && {
                        service: 'gmail'
                    }),
                    auth: {
                        user: configService.get<string>('MAIL_USER'),
                        pass: configService.get<string>('MAIL_PASSWORD'),
                    },
                },
                defaults: {
                    from: `"${configService.get<string>('MAIL_NAME')}" <${configService.get<string>('MAIL_USER')}>`,
                },
                template: {
                    dir: join(__dirname, 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            })
        }),
    ],
    providers: [MailService, ConfigService, ...UserProvider, ...ResetPasswordProvider, ...ValidationAttemptProvider]
})
export class MailModule { }