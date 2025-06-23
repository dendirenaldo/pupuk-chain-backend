import { Pupuk } from "../pupuk.entity";

export interface FindAllPupukInterface {
    readonly data: Pupuk[],
    readonly totalData: number,
    readonly totalRow: number,
}