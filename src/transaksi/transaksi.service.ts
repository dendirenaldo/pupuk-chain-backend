import { BadRequestException, Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { providers, Wallet, Contract } from 'ethers';
import { abi } from './transaksi.abi.json';
import { GetFlowByFertilizerDto, InsertTransaksiDto, QueryTransaksiDto } from './dto';
import { FindAllTransaksiInterface } from './interface';
import { ConfigService } from '@nestjs/config';
import { PengedarType } from 'src/general/pengedar.type';
import { Pengedar } from 'src/pengedar/pengedar.entity';
import { RoleType } from 'src/general/role.type';
import { User } from 'src/user/user.entity';
import { PupukSpesifikasi } from 'src/pupuk/pupuk-spesifikasi.entity';
import { Pupuk } from 'src/pupuk/pupuk.entity';

@Injectable()
export class TransaksiService {
    private contractAddress: string;
    private walletAddress: string;
    private readonly provider: providers.InfuraProvider | providers.JsonRpcProvider;

    constructor(
        private config: ConfigService,

        @Inject('PENGEDAR_REPOSITORY')
        private pengedarRepository: typeof Pengedar,

        @Inject('USER_REPOSITORY')
        private userRepository: typeof User,

        @Inject('PUPUK_REPOSITORY')
        private pupukRepository: typeof Pupuk,
    ) {
        this.provider = this.config.get<string>('IS_INFURA') === 'true' ? new providers.InfuraProvider('sepolia', { projectId: this.config.get<string>('INFURA_PROJECT_ID'), projectSecret: this.config.get<string>('INFURA_PROJECT_SECRET') }) : new providers.JsonRpcProvider(this.config.get<string>('LOCAL_ETHEREUM_NETWORK'));
        this.contractAddress = this.config.get<string>('CONTRACT_2');
        this.walletAddress = this.config.get<string>('ADMIN_PRIVATE_KEY');
    }

    private async _isRegistered(id: number) {
        const wallet = new Wallet(this.walletAddress).connect(this.provider);
        const contract = new Contract(this.contractAddress, abi, wallet);
        const transaksi = await contract.isRegistered(id);
        return transaksi;
    }

    async findAll(query: QueryTransaksiDto): Promise<FindAllTransaksiInterface> {
        const wallet = new Wallet(this.walletAddress).connect(this.provider);
        const contract = new Contract(this.contractAddress, abi, wallet);
        const eventFilter = contract.filters.TransaksiCreated();
        const events = await contract.queryFilter(eventFilter);

        if (!events || events.length === 0) {
            return {
                data: [],
                totalData: 0,
                totalRow: 0
            };
        }

        const allTransaksiDetails = await Promise.all(
            events.reverse().map(async (event) => {
                const transaksiId = event.args.transaksiId;
                const transaksiData = await this.findOne(transaksiId);
                return {
                    ...transaksiData,
                    transactionHash: event.transactionHash,
                    blockNumber: event.blockNumber,
                };
            })
        );

        let filteredData = allTransaksiDetails;

        if (typeof query.search !== 'undefined' && query.search !== null && query.search !== '') {
            filteredData = filteredData.filter((val, index, arr) => val.id.toString().toLowerCase().includes(query.search.toLowerCase()) || val.distributor.name.toLowerCase().includes(query.search.toLowerCase()) || val.retailer.name.toLowerCase().includes(query.search.toLowerCase()));
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

    async findOne(id: number) {
        const wallet = new Wallet(this.walletAddress).connect(this.provider);
        const contract = new Contract(this.contractAddress, abi, wallet);
        const isRegistered = await this._isRegistered(id);

        if (isRegistered === false) {
            throw new BadRequestException({
                statusCode: 400,
                message: 'Transaksi is not registered',
                transaksiNumber: 'transaksiNumber is not registered',
                error: 'Bad Request',
            })
        } else {
            const rawTransaksi = await contract.getTransaksi(id);
            const pupuk = await this.pupukRepository.findByPk(Number(rawTransaksi.fertilizerTypeId), {
                include: [{
                    model: PupukSpesifikasi,
                    as: 'pupukSpesifikasi'
                }]
            });
            return {
                id: Number(rawTransaksi.transaksiId),
                createdAt: Number(rawTransaksi.timestamp),
                distributor: {
                    id: Number(rawTransaksi.distributor.id),
                    name: rawTransaksi.distributor.name,
                    role: rawTransaksi.distributor.role
                },
                retailer: {
                    id: Number(rawTransaksi.retailer.id),
                    name: rawTransaksi.retailer.name,
                    role: rawTransaksi.retailer.role
                },
                fertilizerTypeId: rawTransaksi.fertilizerTypeId,
                fertilizerType: rawTransaksi.fertilizerType,
                fertilizerTypeData: pupuk,
                quantity: Number(rawTransaksi.quantity),
                isExist: rawTransaksi.isExist
            };
        }
    }

    async create(data: InsertTransaksiDto) {
        const wallet = new Wallet(this.walletAddress).connect(this.provider);
        const contract = new Contract(this.contractAddress, abi, wallet);
        const distributor = data?.distributorId ? await this.pengedarRepository.findByPk(data?.distributorId) : null;
        const pengecer = await this.pengedarRepository.findByPk(data.pengecerId);
        const user = await this.userRepository.findByPk(data.pengecerId, { attributes: { exclude: ['password'] } });
        let distributorId: number = 0;
        let distributorName: string = '';
        let distributorRole: RoleType;
        let pengecerId: number = 0;
        let pengecerName: string = '';
        let pengecerRole: RoleType;

        if (((typeof distributor === 'undefined' || distributor === null) && pengecer && pengecer.tingkat === PengedarType.DISTRIBUTOR) || (distributor && distributor.tingkat === PengedarType.DISTRIBUTOR && pengecer && pengecer.tingkat === PengedarType.PENGECER && pengecer.pid === distributor.id) || ((distributor && distributor.tingkat === PengedarType.PENGECER) && (typeof pengecer === 'undefined' || pengecer === null) && (user && user.role === RoleType.PETANI))) {
            if ((typeof distributor === 'undefined' || distributor === null) && pengecer && pengecer.tingkat === PengedarType.DISTRIBUTOR) {
                distributorId = 0;
                distributorName = 'PT. Pupuk Sriwijaya';
                distributorRole = RoleType.PRODUSEN;
                pengecerId = pengecer.id;
                pengecerName = pengecer.nama;
                pengecerRole = RoleType.DISTRIBUTOR;
            } else if (distributor && distributor.tingkat === PengedarType.DISTRIBUTOR && pengecer && pengecer.tingkat === PengedarType.PENGECER && pengecer.pid === distributor.id) {
                distributorId = distributor.id;
                distributorName = distributor.nama;
                distributorRole = RoleType.DISTRIBUTOR;
                pengecerId = pengecer.id;
                pengecerName = pengecer.nama;
                pengecerRole = RoleType.PENGECER;
            } else {
                distributorId = distributor.id;
                distributorName = distributor.nama;
                distributorRole = RoleType.PENGECER;
                pengecerId = pengecer.id;
                pengecerName = pengecer.nama;
                pengecerRole = RoleType.PETANI;
            }

            const distributorData = {
                id: distributorId,
                name: distributorName,
                role: distributorRole
            };
            const pengecerData = {
                id: pengecerId,
                name: pengecerName,
                role: pengecerRole,
            };
            const pupuk = await this.pupukRepository.findByPk(data.fertilizerTypeId);
            const tx = await contract.createTransaksi(
                distributorData,
                pengecerData,
                data.fertilizerTypeId,
                pupuk.nama,
                data.quantity
            );
            return {
                message: `Transaksi registered successfully`,
                data: tx
            };
        } else {
            throw new UnprocessableEntityException('The combination of distributor or pengecer is incorrect.');
        }
    }

    async getFlowByFertilizer(query: GetFlowByFertilizerDto) {
        const { data: allTransactions } = await this.findAll({
            ...(query.distributorId && { distributorId: query.distributorId }),
            ...(query.pengecerId && { pengecerId: query.pengecerId }),
            ...(query.sourceId && { sourceId: query.sourceId }),
        });

        if (!allTransactions || allTransactions.length === 0) {
            return [];
        }

        // Tentukan rentang 3 tahun terakhir
        const currentYear = typeof query.tahun !== 'undefined' && query.tahun.toString().length === 4 ? query.tahun : new Date().getFullYear();
        const years = [currentYear, currentYear - 1, currentYear - 2];

        // Struktur untuk menampung data agregat
        const aggregatedData: {
            [pengedarId: number]: {
                id: number;
                name: string;
                flow: { [year: number]: { year: number; pupukMasuk: number; pupukKeluar: number } };
            };
        } = {};

        // Helper untuk inisialisasi data pengedar jika belum ada
        const initializePengedarData = (id: number, name: string) => {
            if (!aggregatedData[id] && id !== 0) { // ID 0 (Produsen) tidak kita lacak sebagai pengedar
                aggregatedData[id] = { id, name, flow: {} };
                years.forEach(year => {
                    aggregatedData[id].flow[year] = { year, pupukMasuk: 0, pupukKeluar: 0 };
                });
            }
        };

        // Proses setiap transaksi
        allTransactions.forEach((transaksi: any, _, __) => {
            // Filter berdasarkan pupukId
            if (transaksi.fertilizerTypeId.toString() === query.pupukId.toString()) {
                const txYear = new Date(Number(transaksi.createdAt) * 1000).getFullYear();

                // Cek apakah tahun transaksi ada dalam rentang yang ditentukan
                if (years.includes(txYear)) {
                    const { distributor, retailer, quantity } = transaksi;

                    // Proses Distributor (Pupuk Keluar)
                    if (distributor.id !== 0) {
                        initializePengedarData(distributor.id, distributor.name);
                        aggregatedData[distributor.id].flow[txYear].pupukKeluar += Number(quantity);
                    }

                    // Proses Retailer (Pupuk Masuk)
                    if (retailer.id !== 0) { // Petani mungkin tidak memiliki ID pengedar, jadi pastikan ada
                        initializePengedarData(retailer.id, retailer.name);
                        aggregatedData[retailer.id].flow[txYear].pupukMasuk += Number(quantity);
                    }
                }
            }
        });

        // Ubah format akhir agar sesuai dengan struktur yang diinginkan
        const result = Object.values(aggregatedData).map(pengedar => {
            return {
                id: pengedar.id,
                name: pengedar.name,
                yearlyFlow: Object.values(pengedar.flow).sort((a, b) => b.year - a.year), // Urutkan dari tahun terbaru
            };
        });

        return result;
    }
}
