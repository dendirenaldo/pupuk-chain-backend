import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { User } from "./user.entity";
import { ValidationAttempt } from "./validation-attempt.entity";

@Table({
    tableName: 'reset_password'
})
export class ResetPassword extends Model<ResetPassword> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        allowNull: false,
        field: 'unique_code'
    })
    uniqueCode: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER({ length: 10 }).UNSIGNED,
        allowNull: false,
        field: 'user_id'
    })
    userId: number;

    @BelongsTo(() => User, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    user: User;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'created_at'
    })
    createdAt: string

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'updated_at'
    })
    updatedAt: string

    @HasMany(() => ValidationAttempt)
    validationAttempt?: ValidationAttempt[];
}