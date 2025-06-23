
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { ResetPassword } from './reset-password.entity';
import { User } from './user.entity';

@Table({
    tableName: 'validation_attempt'
})
export class ValidationAttempt extends Model<ValidationAttempt>  {
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    })
    id: number;


    @ForeignKey(() => User)
    @Column({
        type: DataType.BIGINT,
        allowNull: true,
        field: 'email_verification'
    })
    emailVerification?: number;

    @ForeignKey(() => ResetPassword)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'reset_verification'
    })
    resetVerification?: number;

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

    @BelongsTo(() => User, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        targetKey: 'verificationCode'
    })
    user: User;

    @BelongsTo(() => ResetPassword, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    resetPassword: ResetPassword;
}