import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './mail/mail.module';
import { SpjbModule } from './spjb/spjb.module';
import { WilayahModule } from './wilayah/wilayah.module';
import { PengedarModule } from './pengedar/pengedar.module';
import { TransaksiModule } from './transaksi/transaksi.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { PupukModule } from './pupuk/pupuk.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ConfigurationModule,
    MailModule,
    UserModule,
    SpjbModule,
    WilayahModule,
    PengedarModule,
    TransaksiModule,
    PupukModule,
  ],
})
export class AppModule { }
