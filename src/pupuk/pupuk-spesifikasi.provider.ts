import { PupukSpesifikasi } from './pupuk-spesifikasi.entity';

export const PupukSpesifikasiProvider = [
    {
        provide: 'PUPUK_SPESIFIKASI_REPOSITORY',
        useValue: PupukSpesifikasi,
    },
];
