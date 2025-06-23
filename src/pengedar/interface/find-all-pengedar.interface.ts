import { Pengedar } from "../pengedar.entity";

export interface FindAllPengedarInterface {
    readonly data: Pengedar[],
    readonly totalData: number,
    readonly totalRow: number,
}