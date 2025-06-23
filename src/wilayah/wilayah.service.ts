import { BadRequestException, Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Wilayah } from './wilayah.entity';
import { InsertWilayahDto, UpdateWilayahDto } from './dto';
import { QueryWilayahDto } from './dto/query-wilayah.dto';
import { FindAllWilayahInterface } from './interface';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';
import { Pengedar } from 'src/pengedar/pengedar.entity';

@Injectable()
export class WilayahService {
    constructor(
        @Inject('WILAYAH_REPOSITORY')
        private wilayahRepository: typeof Wilayah,
    ) { }

    async findAll(query: QueryWilayahDto): Promise<FindAllWilayahInterface> {
        const wilayah = await this.wilayahRepository.findAll({
            include: [{
                model: Pengedar,
                as: 'pengedar'
            }, {
                model: Wilayah,
                as: 'parent',
            }, {
                model: Wilayah,
                as: 'children',
                required: false
            }],
            ...(query?.offset && { offset: query?.offset }),
            ...(query?.limit && { limit: query?.limit }),
            ...(query.order ? {
                order: [[Array.isArray(query.order.index) ? Sequelize.col(query.order.index.slice(0, -1).join('.') + '.' + query.order.index.slice(-1)[0].replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)) : query.order.index, query.order.order]]
            } : {
                order: [['createdAt', 'DESC']]
            }),
            where: {
                ...((typeof query.isParent !== 'undefined' && query.isParent !== null && query.isParent === true) && {
                    pid: {
                        [Op.eq]: null
                    }
                }),
                ...(query.pengedarId && {
                    pengedarId: query.pengedarId
                }),
                ...(query.jenis && {
                    jenis: query.jenis,
                }),
                ...(query.search && {
                    [Op.or]: [{
                        nama: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        jenis: {
                            [Op.like]: `%${query.search}%`
                        },
                    }]
                })
            }
        })
        const totalData = await this.wilayahRepository.count({
            where: {
                ...((typeof query.isParent !== 'undefined' && query.isParent !== null && query.isParent === true) && {
                    pid: {
                        [Op.eq]: null
                    }
                }),
                ...(query.pengedarId && {
                    pengedarId: query.pengedarId
                }),
                ...(query.jenis && {
                    jenis: query.jenis,
                }),
                ...(query.search && {
                    [Op.or]: [{
                        nama: {
                            [Op.like]: `%${query.search}%`
                        },
                    }, {
                        jenis: {
                            [Op.like]: `%${query.search}%`
                        },
                    }]
                })
            }
        })
        return {
            data: wilayah,
            totalData: totalData,
            totalRow: wilayah.length
        }
    }

    async findOne(id: number): Promise<Wilayah> {
        const wilayah = await this.wilayahRepository.findOne({
            include: [{
                model: Pengedar,
                as: 'pengedar'
            }, {
                model: Wilayah,
                as: 'parent',
                required: false
            }, {
                model: Wilayah,
                as: 'children',
                required: false
            }],
            where: { id }
        });

        if (!wilayah) throw new UnprocessableEntityException('Wilayah not found');

        return wilayah;
    }

    async create(data: InsertWilayahDto): Promise<Wilayah> {
        try {
            return await this.wilayahRepository.create(data).then((res) => res);
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

    async update(id: number, data: UpdateWilayahDto, pictureFilename?: Express.Multer.File['filename']): Promise<Wilayah> {
        try {
            return await this.wilayahRepository.update(data, { where: { id } }).then(async (res) => await this.findOne(id));
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

    async delete(id: number): Promise<Wilayah> {
        const wilayah = await this.findOne(id);
        return await this.wilayahRepository.destroy({ where: { id } }).then((_) => wilayah);
    }
}
