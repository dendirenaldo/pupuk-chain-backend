import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, providers } from 'ethers';
import * as Contract1ABI from 'src/spjb/spjb.abi.json';
import * as Contract2ABI from 'src/transaksi/transaksi.abi.json';

@Injectable()
export class BlockchainService {
    private readonly provider: providers.InfuraProvider | providers.JsonRpcProvider;
    private readonly contract1Interface: ethers.utils.Interface;
    private readonly contract2Interface: ethers.utils.Interface;
    private readonly contract1Address: string;
    private readonly contract2Address: string;

    constructor(
        private config: ConfigService,
        private logger: Logger
    ) {
        this.provider = this.config.get<string>('IS_INFURA') === 'true' ? new providers.InfuraProvider('sepolia', { projectId: this.config.get<string>('INFURA_PROJECT_ID'), projectSecret: this.config.get<string>('INFURA_PROJECT_SECRET') }) : new providers.JsonRpcProvider(this.config.get<string>('LOCAL_ETHEREUM_NETWORK'));
        this.contract1Interface = new ethers.utils.Interface(Contract1ABI.abi);
        this.contract2Interface = new ethers.utils.Interface(Contract2ABI.abi);
        this.contract1Address = this.config.get<string>('CONTRACT_1');
        this.contract2Address = this.config.get<string>('CONTRACT_2');
    }

    async getTransaction(transactionHash: string) {
        try {
            this.logger.log(`Fetching details for transaction: ${transactionHash}`);

            if (!ethers.utils.isHexString(transactionHash, 32)) {
                throw new Error('Invalid transaction hash format.');
            }

            const tx = await this.provider.getTransaction(transactionHash);
            const txReceipt = await this.provider.getTransactionReceipt(transactionHash);

            if (!tx || !txReceipt) {
                this.logger.warn(`Transaction not found: ${transactionHash}`);
                throw new NotFoundException(`Transaction with hash "${transactionHash}" not found on the connected node.`);
            }

            let decodedData = null;

            if (tx.data && tx.data !== '0x') {
                let targetInterface: ethers.utils.Interface | null = null;
                const toAddress = tx.to.toLowerCase();

                if (toAddress === this.contract1Address.toLowerCase()) {
                    targetInterface = this.contract1Interface;
                    this.logger.log('Transaction is for Contract 1. Using its ABI.');
                } else if (toAddress === this.contract2Address.toLowerCase()) {
                    targetInterface = this.contract2Interface;
                    this.logger.log('Transaction is for Contract 2. Using its ABI.');
                }

                if (targetInterface) {
                    try {
                        decodedData = targetInterface.parseTransaction({ data: tx.data, value: tx.value });
                    } catch (e) {
                        this.logger.warn(`Could not decode transaction data even with the correct ABI. Error: ${e.message}`);
                        decodedData = { error: "Data parsing failed for the matched ABI." };
                    }
                } else {
                    this.logger.warn(`Transaction 'to' address ${tx.to} does not match known contract addresses.`);
                    decodedData = { error: "Unknown contract address. Cannot decode data." };
                }
            } else {
                decodedData = { info: "Standard ETH transfer (no data)." };
            }

            const result = {
                hash: tx.hash,
                blockNumber: tx.blockNumber,
                blockHash: tx.blockHash,
                from: tx.from,
                to: tx.to,
                value: ethers.utils.formatEther(tx.value) + ' ETH',
                gasPrice: ethers.utils.formatUnits(tx.gasPrice, 'gwei') + ' Gwei',
                gasLimit: tx.gasLimit.toString(),
                nonce: tx.nonce,
                data: tx.data,
                decodedData: decodedData ? {
                    functionName: decodedData.name,
                    functionSignature: decodedData.signature,
                    args: decodedData.args,
                } : null,
                chainId: tx.chainId.toString(),
                confirmations: txReceipt.confirmations,
                receipt: {
                    status: txReceipt.status === 1 ? 'Success' : 'Failed',
                    gasUsed: txReceipt.gasUsed.toString(),
                    cumulativeGasUsed: txReceipt.cumulativeGasUsed.toString(),
                    contractAddress: txReceipt.contractAddress,
                    logs: txReceipt.logs,
                    logsBloom: txReceipt.logsBloom,
                },
            };

            this.logger.log(`Successfully fetched details for transaction: ${transactionHash}`);
            return result;

        } catch (error) {
            this.logger.error(`Failed to fetch transaction ${transactionHash}:`, error.message);

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new Error(`Could not process transaction hash: ${transactionHash}. Ensure the node is running and the hash is correct.`);
        }
    }
}
