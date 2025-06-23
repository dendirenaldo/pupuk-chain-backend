
import { ResetPassword } from './reset-password.entity';

export const ResetPasswordProvider = [
    {
        provide: 'RESET_PASSWORD_REPOSITORY',
        useValue: ResetPassword,
    },
];
