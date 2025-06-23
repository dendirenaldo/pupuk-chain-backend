import { Module } from '@nestjs/common';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';
import { ConfigurationProvider } from './configuration.provider';

@Module({
  controllers: [ConfigurationController],
  providers: [ConfigurationService, ...ConfigurationProvider]
})
export class ConfigurationModule { }
