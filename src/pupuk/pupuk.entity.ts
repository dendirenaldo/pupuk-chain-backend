
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { PupukSpesifikasi } from './pupuk-spesifikasi.entity';

@Table({
    tableName: 'pupuk'
})
export class Pupuk extends Model<Pupuk> {
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    })
    id: number;

    @Column({
        type: new DataType.STRING(191),
        allowNull: false
    })
    nama: string;

    @Column({
        type: DataType.TEXT('medium'),
        allowNull: false
    })
    kemasan: string;

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

    @HasMany(() => PupukSpesifikasi)
    pupukSpesifikasi: PupukSpesifikasi[];
}