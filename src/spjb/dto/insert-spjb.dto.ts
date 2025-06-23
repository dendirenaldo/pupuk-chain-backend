import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class InsertSpjbDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    nomor: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => typeof value === 'string' ? +value : value)
    tahun: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => typeof value === 'string' ? +value : value)
    distributorId?: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => typeof value === 'string' ? +value : value)
    pengecerId: number;

    @ApiProperty()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => Wilayah)
    wilayah: Wilayah[];

    @ApiProperty()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => Approval)
    approval: Approval[];

    @ApiProperty()
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => Realisasi)
    realisasi: Realisasi[];
}

class Wilayah {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    subRegions: string[];
}

class Approval {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    position: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    location: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => typeof value === 'string' ? +value : value)
    priority: number;
}

class Realisasi {
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => typeof value === 'string' ? +value : value)
    fertilizerTypeId: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fertilizerType?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Transform(({ value }) => typeof value === 'string' ? +value : value)
    quantity: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    month: string;
}