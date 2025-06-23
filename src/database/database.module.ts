import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseProvider } from './database.provider';

@Module({
    imports: [ConfigModule.forRoot()],
    providers: [...DatabaseProvider, ConfigService],
    exports: [...DatabaseProvider]
})
export class DatabaseModule { }
