import { PartialType } from "@nestjs/swagger";
import { InsertPupukDto } from "./insert-pupuk.dto";

export class UpdatePupukDto extends PartialType(InsertPupukDto) { }