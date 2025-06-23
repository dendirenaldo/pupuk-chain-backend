import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { WilayahType } from "src/general/wilayah.type";

export class InsertWilayahDto {
    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? +value : value)
    @IsNumber()
    pid?: number;

    @ApiProperty()
    @IsNotEmpty()
    @Transform(({ value }) => typeof value === 'string' ? +value : value)
    @IsNumber()
    pengedarId: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    nama: string;

    @ApiProperty({ enum: WilayahType })
    @IsNotEmpty()
    @IsEnum(WilayahType)
    jenis: WilayahType;
}