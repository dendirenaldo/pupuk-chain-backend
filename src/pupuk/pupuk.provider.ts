import { Pupuk } from './pupuk.entity';

export const PupukProvider = [
    {
        provide: 'PUPUK_REPOSITORY',
        useValue: Pupuk,
    },
];
