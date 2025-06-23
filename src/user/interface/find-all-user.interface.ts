import { User } from "../user.entity";

export interface FindAllUserInterface {
    readonly data: User[],
    readonly totalData: number,
    readonly totalRow: number,
}