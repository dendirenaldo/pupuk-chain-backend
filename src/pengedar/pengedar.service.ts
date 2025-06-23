import { BadRequestException, Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Pengedar } from './pengedar.entity';
import { InsertPengedarDto, UpdatePengedarDto } from './dto';
import { QueryPengedarDto } from './dto/query-pengedar.dto';
import { FindAllPengedarInterface } from './interface';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { PengedarType } from 'src/general/pengedar.type';
import { Wilayah } from 'src/wilayah/wilayah.entity';

@Injectable()
export class PengedarService {
    constructor(
        @Inject('PENGEDAR_REPOSITORY')
        private pengedarRepository: typeof Pengedar,
    ) { }

    async findAll(query: QueryPengedarDto): Promise<FindAllPengedarInterface> {
        const pengedar = await this.pengedarRepository.findAll({
            include: [{
                model: Pengedar,
                as: 'distributor'
            }, {
                model: Wilayah,
                as: 'wilayah',
                where: {
                    pid: {
                        [Op.is]: null
                    }
                },
                separate: true,
                include: [{
                    model: Wilayah,
                    as: 'children'
                }]
            }],
            ...(query?.offset && { offset: query?.offset }),
            ...(query?.limit && { limit: query?.limit }),
            ...(query.order ? {
                order: [[Array.isArray(query.order.index) ? Sequelize.col(query.order.index.join('.')) : query.order.index, query.order.order]]
            } : {
                order: [['createdAt', 'DESC']]
            }),
            where: {
                ...(query.tingkat && {
                    tingkat: query.tingkat
                }),
                ...(query.pid && {
                    pid: query.pid,
                }),
                ...(query.search && {
                    [Op.or]: [{
                        nama: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        tingkat: {
                            [Op.like]: `%${query.search}%`
                        },
                    }]
                })
            }
        })
        const totalData = await this.pengedarRepository.count({
            include: [{
                model: Pengedar,
                as: 'distributor'
            }, {
                model: Wilayah,
                as: 'wilayah',
                where: {
                    pid: {
                        [Op.is]: null
                    }
                },
                separate: true,
                include: [{
                    model: Wilayah,
                    as: 'children'
                }]
            }],
            where: {
                ...(query.tingkat && {
                    tingkat: query.tingkat
                }),
                ...(query.pid && {
                    pid: query.pid,
                }),
                ...(query.search && {
                    [Op.or]: [{
                        nama: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        tingkat: {
                            [Op.like]: `%${query.search}%`
                        },
                    }]
                })
            }
        })
        return {
            data: pengedar,
            totalData: totalData,
            totalRow: pengedar.length
        }
    }

    async findOne(id: number): Promise<Pengedar> {
        const pengedar = await this.pengedarRepository.findOne({
            include: [{
                model: Wilayah,
                as: 'wilayah',
                include: [{
                    model: Wilayah,
                    as: 'children'
                }]
            }],
            where: { id }
        });

        if (!pengedar) throw new UnprocessableEntityException('Pengedar not found');

        return pengedar;
    }

    async create(data: InsertPengedarDto, filename: Express.Multer.File['filename']): Promise<Pengedar> {
        const { kop, ...filteredData } = data;

        try {
            if (data.tingkat === PengedarType.PENGECER && (typeof data.pid === 'undefined' || data.pid === null || data.pid === 0)) throw new BadRequestException({
                statusCode: 400,
                pid: 'pid shouldn\'t be empty',
                error: 'Bad Request'
            })
            return await this.pengedarRepository.create({ ...filteredData, kop: filename }).then((res) => res);
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

    async update(id: number, data: UpdatePengedarDto, filename?: Express.Multer.File['filename']): Promise<Pengedar> {
        const { kop, ...filteredData } = data;

        try {
            if (data.tingkat === PengedarType.PENGECER && (typeof data.pid === 'undefined' || data.pid === null || data.pid === 0)) throw new BadRequestException({
                statusCode: 400,
                pid: 'pid shouldn\'t be empty',
                error: 'Bad Request'
            })
            return await this.pengedarRepository.update({ ...filteredData, ...(filename && { kop: filename }) }, { where: { id } }).then(async (res) => await this.findOne(id));
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

    async delete(id: number): Promise<Pengedar> {
        const pengedar = await this.findOne(id);
        return await this.pengedarRepository.destroy({ where: { id } }).then((_) => pengedar);
    }
}
