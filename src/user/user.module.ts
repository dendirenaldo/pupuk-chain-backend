import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserProvider } from './user.provider';
import { ResetPasswordProvider } from './reset-password.provider';
import { ValidationAttemptProvider } from './validation-attempt.provider';
import { JwtStrategy } from './strategy';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';

@Module({
    imports: [JwtModule.register({})],
    controllers: [UserController],
    providers: [UserService, MailService, JwtStrategy, ...UserProvider, ...ResetPasswordProvider, ...ValidationAttemptProvider]
})
export class UserModule { }
