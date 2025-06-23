import { Wilayah } from './wilayah.entity';

export const WilayahProvider = [
    {
        provide: 'WILAYAH_REPOSITORY',
        useValue: Wilayah,
    },
];
