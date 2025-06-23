import { Configuration } from './configuration.entity';

export const ConfigurationProvider = [
    {
        provide: 'CONFIGURATION_REPOSITORY',
        useValue: Configuration,
    },
];
