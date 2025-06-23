import { Module } from '@nestjs/common';
import { PupukController } from './pupuk.controller';
import { PupukService } from './pupuk.service';
import { PupukProvider } from './pupuk.provider';
import { PupukSpesifikasiProvider } from './pupuk-spesifikasi.provider';

@Module({
  controllers: [PupukController],
  providers: [PupukService, ...PupukProvider, ...PupukSpesifikasiProvider]
})
export class PupukModule { }
