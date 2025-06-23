import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";

@Table({
    tableName: 'configuration',
    indexes: [{
        unique: true,
        fields: ['name']
    }]
})
export class Configuration extends Model<Configuration> {
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    })
    id: number;

    @Column({
        type: new DataType.STRING(191),
        allowNull: false
    })
    name: string;

    @Column({
        type: DataType.TEXT('long'),
        allowNull: false
    })
    value: string;

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
}