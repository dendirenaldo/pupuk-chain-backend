import { BadRequestException, Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { providers, Wallet, Contract } from 'ethers';
import { abi } from './spjb.abi.json';
import { InsertSpjbDto, QuerySpjbDto } from './dto';
import { FindAllSpjbInterface } from './interface';
import { ConfigService } from '@nestjs/config';
import { Pengedar } from 'src/pengedar/pengedar.entity';
import { PengedarType } from 'src/general/pengedar.type';
import { Pupuk } from 'src/pupuk/pupuk.entity';
import { PupukSpesifikasi } from 'src/pupuk/pupuk-spesifikasi.entity';

@Injectable()
export class SpjbService {
    private contractAddress: string;
    private walletAddress: string;
    private readonly provider: providers.InfuraProvider | providers.JsonRpcProvider;

    constructor(
        private config: ConfigService,

        @Inject('PENGEDAR_REPOSITORY')
        private pengedarRepository: typeof Pengedar,

        @Inject('PUPUK_REPOSITORY')
        private pupukRepository: typeof Pupuk,
    ) {
        this.provider = this.config.get<string>('IS_INFURA') === 'true' ? new providers.InfuraProvider('sepolia', { projectId: this.config.get<string>('INFURA_PROJECT_ID'), projectSecret: this.config.get<string>('INFURA_PROJECT_SECRET') }) : new providers.JsonRpcProvider(this.config.get<string>('LOCAL_ETHEREUM_NETWORK'));
        this.contractAddress = this.config.get<string>('CONTRACT_1');
        this.walletAddress = this.config.get<string>('ADMIN_PRIVATE_KEY');
    }

    private async _isRegistered(spjbNumber: string) {
        const wallet = new Wallet(this.walletAddress).connect(this.provider);
        const contract = new Contract(this.contractAddress, abi, wallet);
        const transaksi = await contract.isRegistered(spjbNumber);
        return transaksi;
    }

    async findAll(query: QuerySpjbDto): Promise<FindAllSpjbInterface> {
        const wallet = new Wallet(this.walletAddress).connect(this.provider);
        const contract = new Contract(this.contractAddress, abi, wallet);
        const eventFilter = contract.filters.SPJBCreated();
        const events = await contract.queryFilter(eventFilter);

        if (!events || events.length === 0) {
            return {
                data: [],
                totalData: 0,
                totalRow: 0
            };
        }

        const allSpjbDetails = await Promise.all(
            events.reverse().map(async (event) => {
                const spjbNumber = event.args.spjbNumber;
                const spjbData = await this.findOne(spjbNumber);
                return {
                    ...spjbData,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                };
            })
        );

        let filteredData = allSpjbDetails;

        if (typeof query.search !== 'undefined' && query.search !== null && query.search !== '') {
            filteredData = filteredData.filter((val, index, arr) => val.spjbNumber.toLowerCase().includes(query.search.toLowerCase()) || val.spjbYear.toString().toLowerCase().includes(query.search.toLowerCase()) || val.distributor.name.toLowerCase().includes(query.search.toLowerCase()) || val.retailer.name.toLowerCase().includes(query.search.toLowerCase()));
        }

        if (typeof query.distributorId !== 'undefined' && query.distributorId !== null && query.distributorId !== 0) {
            filteredData = filteredData.filter((val, index, arr) => +val.distributor.id === query.distributorId);
        }

        if (typeof query.pengecerId !== 'undefined' && query.pengecerId !== null && query.pengecerId !== 0) {
            filteredData = filteredData.filter((val, index, arr) => +val.retailer.id === query.pengecerId);
        }

        if (typeof query.sourceId !== 'undefined' && query.sourceId !== null && query.sourceId !== 0) {
            filteredData = filteredData.filter((val, index, arr) => +val.distributor.id === query.sourceId || +val.retailer.id === query.sourceId);
        }

        if (query.order) {
            filteredData.sort((a, b) => {
                // Note: You might want to add 'transactionHash' or 'blockNumber' as sortable indexes.
                const valA = a[query.order.index as string];
                const valB = b[query.order.index as string];
                const direction = query.order.order.toUpperCase() === 'ASC' ? 1 : -1;

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return (valA - valB) * direction;
                }

                if (typeof valA === 'string' && typeof valB === 'string') {
                    return valA.localeCompare(valB) * direction;
                }

                return 0;
            });
        }

        const paginatedData = query?.offset && query?.limit ? filteredData.slice(query.offset, query.offset + query.limit) : filteredData;

        return {
            data: paginatedData,
            totalData: filteredData.length,
            totalRow: paginatedData.length
        };
    }

    async findOne(spjbNumber: string) {
        const wallet = new Wallet(this.walletAddress).connect(this.provider);
        const contract = new Contract(this.contractAddress, abi, wallet);
        const isRegistered = await this._isRegistered(spjbNumber);

        if (isRegistered === false) {
            throw new BadRequestException({
                statusCode: 400,
                message: 'SPJB is not registered',
                spjbNumber: 'spjbNumber is not registered',
                error: 'Bad Request',
            })
        } else {
            const rawSPJB = await contract.getSPJB(spjbNumber);
            const formattedSPJB = {
                spjbNumber: rawSPJB.spjbNumber,
                spjbYear: Number(rawSPJB.spjbYear),
                spjbType: rawSPJB.spjbType,
                spjbKop: rawSPJB.spjbKop,
                distributor: {
                    id: Number(rawSPJB.distributor.id),
                    name: rawSPJB.distributor.name,
                    role: rawSPJB.distributor.role
                },
                retailer: {
                    id: Number(rawSPJB.retailer.id),
                    name: rawSPJB.retailer.name,
                    role: rawSPJB.retailer.role
                },
                timestamp: Number(rawSPJB.timestamp),
                isExist: rawSPJB.isExist,

                approvers: rawSPJB.approvers.map(approver => ({
                    name: approver.name,
                    position: approver.position,
                    priority: Number(approver.priority),
                    location: approver.location
                })),

                regions: rawSPJB.regions.map(region => ({
                    name: region.name,
                    subRegions: region.subRegions
                })),

                fertilizerSales: await Promise.all(rawSPJB.fertilizerSales.map(async (sale) => {
                    const pupuk = await this.pupukRepository.findByPk(Number(sale.fertilizerTypeId), {
                        include: [{
                            model: PupukSpesifikasi,
                            as: 'pupukSpesifikasi'
                        }]
                    });
                    return {
                        fertilizerTypeId: Number(sale.fertilizerTypeId),
                        fertilizerType: sale.fertilizerType,
                        fertilizerTypeData: pupuk ?? null,
                        quantity: Number(sale.quantity),
                        month: sale.month,
                    }
                }))
            };
            return formattedSPJB;
        }
    }

    async create(data: InsertSpjbDto) {
        const wallet = new Wallet(this.walletAddress).connect(this.provider);
        const contract = new Contract(this.contractAddress, abi, wallet);
        const isRegistered = await this._isRegistered(data.nomor);

        if (isRegistered === true) {
            throw new BadRequestException({
                statusCode: 400,
                message: 'SPJB is registered',
                spjbNumber: 'spjbNumber is registered',
                error: 'Bad Request',
            })
        } else {
            const distributor = data?.distributorId ? await this.pengedarRepository.findByPk(data?.distributorId) : null;
            const pengecer = await this.pengedarRepository.findByPk(data.pengecerId);
            let spjbType = 'Produsen - Distributor';
            let kop = 'default_kop.jpg';
            let distributorId: number = 0;
            let distributorName: string = '';
            let distributorRole: PengedarType | string;
            let pengecerId: number = 0;
            let pengecerName: string = '';
            let pengecerRole: PengedarType;

            if (((typeof distributor === 'undefined' || distributor === null) && pengecer && pengecer.tingkat === PengedarType.DISTRIBUTOR) || (distributor && distributor.tingkat === PengedarType.DISTRIBUTOR && pengecer && pengecer.tingkat === PengedarType.PENGECER && pengecer.pid === distributor.id)) {
                if ((typeof distributor === 'undefined' || distributor === null) && pengecer && pengecer.tingkat === PengedarType.DISTRIBUTOR) {
                    spjbType = 'Produsen - Distributor';
                    kop = 'default_kop.jpg';
                    distributorId = 0;
                    distributorName = 'PT. Pupuk Sriwijaya';
                    distributorRole = 'Produsen';
                    pengecerId = pengecer.id;
                    pengecerName = pengecer.nama;
                    pengecerRole = pengecer.tingkat;
                } else {
                    spjbType = 'Distributor - Pengecer';
                    kop = distributor.kop ?? 'default_kop.jpg';
                    distributorId = distributor.id;
                    distributorName = distributor.nama;
                    distributorRole = distributor.tingkat;
                    pengecerId = pengecer.id;
                    pengecerName = pengecer.nama;
                    pengecerRole = pengecer.tingkat;
                }
                const distributorData = {
                    id: distributorId,
                    name: distributorName,
                    role: distributorRole
                };
                const pengecerData = {
                    id: pengecerId,
                    name: pengecerName,
                    role: pengecerRole
                };
                const realisasiData = await Promise.all(data.realisasi.map(async (val, index, arr) => {
                    const pupuk = await this.pupukRepository.findByPk(val.fertilizerTypeId);
                    return {
                        ...val,
                        fertilizerType: pupuk.nama
                    };
                }));
                const tx = await contract.createSPJB(
                    data.nomor,
                    data.tahun,
                    spjbType,
                    kop,
                    distributorData,
                    pengecerData,
                    data.approval,
                    data.wilayah,
                    realisasiData
                );
                return {
                    message: `SPJB ${data.nomor} registered successfully`,
                    data: tx
                };
            } else {
                throw new UnprocessableEntityException('The combination of distributor or pengecer is incorrect.');
            }
        }
    }
}
