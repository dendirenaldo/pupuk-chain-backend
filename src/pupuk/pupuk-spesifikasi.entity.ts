
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Pupuk } from './pupuk.entity';

@Table({
    tableName: 'pupuk_spesifikasi'
})
export class PupukSpesifikasi extends Model<PupukSpesifikasi> {
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    })
    id: number;

    @ForeignKey(() => Pupuk)
    @Column({
        type: DataType.INTEGER({ length: 10 }).UNSIGNED,
        allowNull: true,
        field: 'pupuk_id'
    })
    pupukId?: number;

    @Column({
        type: new DataType.STRING(191),
        allowNull: false
    })
    kandungan: string;

    @Column({
        type: DataType.TEXT('medium'),
        allowNull: false
    })
    deskripsi: string;

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

    @BelongsTo(() => Pupuk, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    })
    pupuk: Pupuk;
}