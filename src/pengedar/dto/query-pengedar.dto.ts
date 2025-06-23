import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { PengedarType } from "src/general/pengedar.type";

class OrderDto {
    @ApiPropertyOptional({ enum: ['nama', 'alamat', 'npwp', 'kontakNama', 'kontakEmail', 'bankNama', 'bankNomorRekening', 'bankAtasNama', 'tingkat'] })
    @IsOptional()
    @IsEnum(['nama', 'alamat', 'npwp', 'kontakNama', 'kontakEmail', 'bankNama', 'bankNomorRekening', 'bankAtasNama', 'tingkat'])
    index: string | Array<string>;

    @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    order: string;
}

export class QueryPengedarDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => typeof value == 'string' ? parseInt(value) : value)
    offset?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => typeof value == 'string' ? parseInt(value) : value)
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => typeof value == 'string' ? JSON.parse(value) : value)
    @Type(() => OrderDto)
    order?: OrderDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => typeof value == 'string' ? parseInt(value) : value)
    pid?: number;

    @ApiPropertyOptional({ enum: PengedarType })
    @IsOptional()
    @IsEnum(PengedarType)
    tingkat?: PengedarType;
}