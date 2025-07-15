import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

class OrderDto {
    @ApiPropertyOptional({ enum: ['distributorName', 'retailerName'] })
    @IsOptional()
    @IsEnum(['distributorName', 'retailerName'])
    index: string | Array<string>;

    @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    order: string;
}

export class QueryTransaksiDto {
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
    @Transform(({ value }) => typeof value == 'string' ? +value : value)
    distributorId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => typeof value == 'string' ? +value : value)
    pengecerId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => typeof value == 'string' ? +value : value)
    sourceId?: number;
}