import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

class TypeDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    value: string;
}

export class UpsertConfigurationDto {
    @ApiProperty({
        example: [
            {
                name: 'application_name',
                value: 'IMWORK'
            },
            {
                name: 'application_logo',
                value: 'default.png'
            }
        ]
    })
    @ValidateNested({ each: true })
    @IsArray()
    @Type(() => TypeDto)
    upsert: TypeDto[];
}