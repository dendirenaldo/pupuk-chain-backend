import { PartialType } from "@nestjs/swagger";
import { InsertWilayahDto } from "./insert-wilayah.dto";

export class UpdateWilayahDto extends PartialType(InsertWilayahDto) { }