import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class QueryConfigurationDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    name: string[];
}