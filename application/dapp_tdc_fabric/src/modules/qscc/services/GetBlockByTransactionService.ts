import { logger } from '../../../shared/utils/logger';
import * as config from '../../../config/config';
import { Contract } from 'fabric-network';
import { evaluateTransaction } from '../../../shared/utils/fabric';
import { handleError } from '../../../shared/errors/error';
import * as common from 'fabric-common';

const BlockDecoder = (common as any).BlockDecoder;
import * as protos from 'fabric-protos';

interface IRequest {
  qsccContract: Contract;
  txId: string;
}

class GetBlockByTransactionService {
  public async execute({ qsccContract, txId }: IRequest): Promise<any> {
    try {
      logger.info(`---> GetBlockByTransactionService: ${txId} <---`);
      const data = await evaluateTransaction(qsccContract, 'GetBlockByTxID', config.channelName, txId);

      const decodedBlock: protos.common.Block = BlockDecoder.decode(data);
      const blockNum = decodedBlock.header?.number ? decodedBlock.header?.number.toString() : '';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const dataHash = decodedBlock.header?.data_hash ? decodedBlock.header?.data_hash.toString('hex') : '';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const previousHash = decodedBlock.header?.previous_hash ? decodedBlock.header?.previous_hash.toString('hex') : '';

      const blockInfo = {
        blockNum,
        dataHash,
        previousHash,
        block: decodedBlock,
      };

      logger.info(`---> GetBlockByTransactionService Block number: ${blockNum} - hash: ${dataHash} - previouse hash: ${previousHash.toString()} end < ---`);
      return { blockInfo };
    } catch (err) {
      throw handleError(err);
    }
  }
}

export default GetBlockByTransactionService;
