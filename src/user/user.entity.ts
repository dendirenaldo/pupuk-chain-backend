
import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';
import { RoleType } from 'src/general/role.type';
import { ValidationAttempt } from './validation-attempt.entity';
import { ResetPassword } from './reset-password.entity';
import { Pengedar } from 'src/pengedar/pengedar.entity';

@Table({
    tableName: 'user',
    indexes: [{
        unique: true,
        fields: ['verification_code']
    }, {
        unique: true,
        fields: ['email']
    }]
})
export class User extends Model<User> {
    @Column({
        type: DataType.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    })
    id: number;

    @Column({
        type: DataType.BIGINT,
        allowNull: true,
        field: 'verification_code'
    })
    verificationCode?: number;

    @Column({
        type: new DataType.STRING(191),
        allowNull: false
    })
    email: string;

    @Column({
        type: new DataType.STRING(191),
        allowNull: true
    })
    password?: string;

    @Column({
        type: new DataType.STRING(191),
        allowNull: false,
        field: 'full_name'
    })
    fullName: string;

    @Column({
        type: DataType.ENUM(RoleType.ADMIN, RoleType.PRODUSEN, RoleType.DISTRIBUTOR, RoleType.PENGECER, RoleType.PETANI),
        allowNull: false
    })
    role: RoleType;

    @ForeignKey(() => Pengedar)
    @Column({
        type: DataType.INTEGER({ length: 10 }).UNSIGNED,
        allowNull: true,
        field: 'pengedar_id'
    })
    pengedarId?: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_active'
    })
    isActive: boolean;

    @Column({
        type: new DataType.STRING(191),
        allowNull: false,
        defaultValue: 'default.png',
    })
    picture: string;

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

    @HasOne(() => ResetPassword)
    resetPassword: ResetPassword

    @HasMany(() => ValidationAttempt, { sourceKey: 'verificationCode' })
    validationAttempt?: ValidationAttempt[];

    @BelongsTo(() => Pengedar, {
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })
    pengedar?: Pengedar;
}