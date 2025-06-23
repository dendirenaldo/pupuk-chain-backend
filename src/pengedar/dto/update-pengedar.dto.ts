import { ApiProperty, PartialType } from "@nestjs/swagger";
import { InsertPengedarDto } from "./insert-pengedar.dto";

export class UpdatePengedarDto extends PartialType(InsertPengedarDto) {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        required: false
    })
    kop?: Express.Multer.File;
}