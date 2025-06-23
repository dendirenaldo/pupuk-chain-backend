import { BadRequestException, Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Pupuk } from './pupuk.entity';
import { InsertPupukDto, UpdatePupukDto } from './dto';
import { QueryPupukDto } from './dto/query-pupuk.dto';
import { FindAllPupukInterface } from './interface';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Wilayah } from 'src/wilayah/wilayah.entity';
import { PupukSpesifikasi } from './pupuk-spesifikasi.entity';

@Injectable()
export class PupukService {
    constructor(
        @Inject('PUPUK_REPOSITORY')
        private pupukRepository: typeof Pupuk,

        @Inject('PUPUK_SPESIFIKASI_REPOSITORY')
        private pupukSpesifikasiRepository: typeof PupukSpesifikasi,
    ) { }

    async findAll(query: QueryPupukDto): Promise<FindAllPupukInterface> {
        const pupuk = await this.pupukRepository.findAll({
            include: [{
                model: PupukSpesifikasi,
                as: 'pupukSpesifikasi'
            }],
            ...(query?.offset && { offset: query?.offset }),
            ...(query?.limit && { limit: query?.limit }),
            ...(query.order ? {
                order: [[Array.isArray(query.order.index) ? Sequelize.col(query.order.index.join('.')) : query.order.index, query.order.order]]
            } : {
                order: [['createdAt', 'DESC']]
            }),
            where: {
                ...(query.search && {
                    [Op.or]: [{
                        nama: {
                            [Op.like]: `%${query.search}%`
                        },
                    }]
                })
            }
        })
        const totalData = await this.pupukRepository.count({
            include: [{
                model: PupukSpesifikasi,
                as: 'pupukSpesifikasi',
                separate: true
            }],
            where: {
                ...(query.search && {
                    [Op.or]: [{
                        nama: {
                            [Op.like]: `%${query.search}%`
                        },
                    }]
                })
            }
        })
        return {
            data: pupuk,
            totalData: totalData,
            totalRow: pupuk.length
        }
    }

    async findOne(id: number): Promise<Pupuk> {
        const pupuk = await this.pupukRepository.findOne({
            include: [{
                model: PupukSpesifikasi,
                as: 'pupukSpesifikasi'
            }],
            where: { id }
        });

        if (!pupuk) throw new UnprocessableEntityException('Pupuk not found');

        return pupuk;
    }

    async create(data: InsertPupukDto): Promise<Pupuk> {
        try {
            const { spesifikasi, ...filteredData } = data;
            return await this.pupukRepository.create(filteredData).then(async (res) => {
                return await Promise.all(spesifikasi.map(async (val, index, arr) => {
                    await this.pupukSpesifikasiRepository.create({ pupukId: res.id, ...val });
                })).then(() => res);
            }).then((res) => this.findOne(res.id));
        } catch (err) {
            console.log(err)
            const errors = err.errors.map((val) => ({
                [val.path]: val.message
            }));

            if (err.name === 'SequelizeUniqueConstraintError') throw new BadRequestException({
                statusCode: 400,
                ...errors.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
                error: 'Bad Request',

            })
        }
    }

    async update(id: number, data: UpdatePupukDto): Promise<Pupuk> {
        try {
            const { spesifikasi, ...filteredData } = data;
            return await this.pupukRepository.update(filteredData, { where: { id } }).then(async (res) => {
                await this.pupukSpesifikasiRepository.destroy({ where: { pupukId: id } });
                return await Promise.all(spesifikasi.map(async (val, index, arr) => {
                    await this.pupukSpesifikasiRepository.create({ pupukId: id, ...val });
                })).then(() => res);
            }).then((res) => this.findOne(id));
        } catch (err) {
            const errors = err.errors.map((val) => ({
                [val.path]: val.message
            }));

            if (err.name === 'SequelizeUniqueConstraintError') throw new BadRequestException({
                statusCode: 400,
                ...errors.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
                error: 'Bad Request',

            })
        }
    }

    async delete(id: number): Promise<Pupuk> {
        const pupuk = await this.findOne(id);
        return await this.pupukRepository.destroy({ where: { id } }).then((_) => pupuk);
    }
}
