import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { PengedarType } from "src/general/pengedar.type";

export class InsertPengedarDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => typeof value === 'string' ? +value : value)
    pid?: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    nomor: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    nama: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    alamat?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    npwp?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    kontakNama?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    kontakEmail?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bankNama?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bankNomorRekening?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bankAtasNama?: string;

    @ApiProperty({ enum: PengedarType })
    @IsNotEmpty()
    @IsEnum(PengedarType)
    tingkat: PengedarType;

    @ApiProperty({
        type: 'string',
        format: 'binary',
        required: true
    })
    kop: Express.Multer.File;
}