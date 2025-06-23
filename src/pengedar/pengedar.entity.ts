
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { PengedarType } from 'src/general/pengedar.type';
import { User } from 'src/user/user.entity';
import { Wilayah } from 'src/wilayah/wilayah.entity';

@Table({
    tableName: 'pengedar',
    indexes: [{
        unique: true,
        fields: ['nomor']
    }]
})
export class Pengedar extends Model<Pengedar> {
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    })
    id: number;

    @ForeignKey(() => Pengedar)
    @Column({
        type: DataType.INTEGER({ length: 10 }).UNSIGNED,
        allowNull: true
    })
    pid?: number;

    @Column({
        type: new DataType.STRING(191),
        allowNull: false
    })
    nomor: string;

    @Column({
        type: new DataType.STRING(191),
        allowNull: false
    })
    nama: string;

    @Column({
        type: new DataType.STRING(32),
        allowNull: true
    })
    npwp?: string;

    @Column({
        type: DataType.TEXT('medium'),
        allowNull: true
    })
    alamat?: string;

    @Column({
        type: new DataType.STRING(191),
        allowNull: true,
    })
    kop?: string;

    @Column({
        type: new DataType.STRING(191),
        allowNull: true,
        field: 'kontak_nama'
    })
    kontakNama?: string;

    @Column({
        type: new DataType.STRING(191),
        allowNull: true,
        field: 'kontak_nama'
    })
    kontakEmail?: string;

    @Column({
        type: new DataType.STRING(191),
        allowNull: true,
        field: 'bank_nama'
    })
    bankNama?: string;

    @Column({
        type: new DataType.STRING(191),
        allowNull: true,
        field: 'bank_nomor_rekening'
    })
    bankNomorRekening?: string;

    @Column({
        type: new DataType.STRING(191),
        allowNull: true,
        field: 'bank_atas_nama'
    })
    bankAtasNama?: string;

    @Column({
        type: DataType.ENUM(PengedarType.DISTRIBUTOR, PengedarType.PENGECER),
        allowNull: false,
    })
    tingkat: PengedarType;

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
    distributor?: Pengedar;

    @HasMany(() => Wilayah)
    wilayah: Wilayah[];

    @HasMany(() => Pengedar)
    pengecer?: Pengedar[];

    @HasMany(() => User)
    user?: User[];
}