import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Op } from 'sequelize';
import { QueryConfigurationDto, UpsertConfigurationDto, UpsertConfigurationImageDto } from './dto';
import { Configuration } from './configuration.entity';

@Injectable()
export class ConfigurationService {
    constructor(
        @Inject('CONFIGURATION_REPOSITORY')
        private configurationRepository: typeof Configuration
    ) { }

    async findAll(query: QueryConfigurationDto): Promise<Configuration[]> {
        const configuration = await this.configurationRepository.findAll({ where: { name: { [Op.in]: query.name } }, raw: true })
        return configuration
    }

    async upsert(data: UpsertConfigurationDto) {
        let name = []

        const upsertData = Promise.all(
            data.upsert.map(async (val) => {
                name.push(val.name);
                await this.configurationRepository.upsert({
                    name: val.name,
                    value: val.value
                })
            })
        ).then(async () => {
            return await this.configurationRepository.findAll({ where: { name: { [Op.in]: name } } })
        })

        return upsertData
    }

    async upsertGambar(filename: string, data: UpsertConfigurationImageDto) {
        return this.upsert({
            upsert: [{
                name: data.name,
                value: filename
            }]
        });
    }

    async delete(name: string) {
        const configuration = await this.configurationRepository.findOne({ where: { name: name } });

        if (!configuration) throw new UnprocessableEntityException('Configuration not found');

        return await this.configurationRepository.destroy({ where: { name: name } }).then(() => configuration);
    }
}
