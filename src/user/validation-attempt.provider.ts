
import { ValidationAttempt } from './validation-attempt.entity';

export const ValidationAttemptProvider = [
    {
        provide: 'VALIDATION_ATTEMPT_REPOSITORY',
        useValue: ValidationAttempt,
    },
];
