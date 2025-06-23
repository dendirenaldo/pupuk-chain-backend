import { Wilayah } from "../wilayah.entity";

export interface FindAllWilayahInterface {
    readonly data: Wilayah[],
    readonly totalData: number,
    readonly totalRow: number,
}