import { ApiProperty } from "@nestjs/swagger";

export class ChangeProfilePictureDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        required: true
    })
    picture: Express.Multer.File;
}