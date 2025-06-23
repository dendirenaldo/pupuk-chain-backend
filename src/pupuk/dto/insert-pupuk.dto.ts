import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";

export class InsertPupukDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    nama: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    kemasan: string;

    @ApiProperty()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => PupukSpesifikasiDto)
    spesifikasi: PupukSpesifikasiDto[];
}

export class PupukSpesifikasiDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    kandungan: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    deskripsi: string;
}