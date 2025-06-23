
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { Pengedar } from 'src/pengedar/pengedar.entity';
import { WilayahType } from 'src/general/wilayah.type';

@Table({
    tableName: 'wilayah',
})
export class Wilayah extends Model<Wilayah> {
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    })
    id: number;

    @ForeignKey(() => Pengedar)
    @Column({
        type: DataType.INTEGER({ length: 10 }).UNSIGNED,
        allowNull: false,
        field: 'pengedar_id'
    })
    pengedarId: number;

    @ForeignKey(() => Wilayah)
    @Column({
        type: DataType.INTEGER({ length: 10 }).UNSIGNED,
        allowNull: true,
    })
    pid?: number;

    @Column({
        type: new DataType.STRING(191),
        allowNull: false,
    })
    nama: string;

    @Column({
        type: new DataType.ENUM(WilayahType.KABUPATEN, WilayahType.KECAMATAN, WilayahType.KELURAHAN),
        allowNull: false
    })
    jenis: WilayahType;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'created_at'
    })
    createdAt: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'updated_at'
    })
    updatedAt: string;

    @BelongsTo(() => Pengedar, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    pengedar: Pengedar;

    @BelongsTo(() => Wilayah, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    parent: Wilayah;

    @HasMany(() => Wilayah)
    children?: Wilayah[];
}