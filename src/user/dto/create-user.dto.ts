import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { RoleType } from "src/general/role.type";

export class CreateUserDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiProperty({ enum: RoleType })
    @IsNotEmpty()
    @IsEnum(RoleType)
    role: RoleType;

    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    @Transform(({ value }) => typeof value === 'string' && value !== '' ? JSON.parse(value) : value)
    isActive: boolean;

    @ApiProperty({
        type: 'string',
        format: 'binary',
        required: false
    })
    picture?: Express.Multer.File;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => typeof value === 'string' ? +value : value)
    pengedarId?: number;
}