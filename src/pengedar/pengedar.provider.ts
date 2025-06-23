import { Pengedar } from './pengedar.entity';

export const PengedarProvider = [
    {
        provide: 'PENGEDAR_REPOSITORY',
        useValue: Pengedar,
    },
];
