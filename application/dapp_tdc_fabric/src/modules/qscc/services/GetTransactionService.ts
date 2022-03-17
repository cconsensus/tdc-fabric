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

class GetTransactionValidationCodeService {
  public async execute({ qsccContract, txId }: IRequest): Promise<any> {
    try {
      logger.info(`---> GetTransactionValidationCodeService: ${txId} <---`);
      const data = await evaluateTransaction(qsccContract, 'GetTransactionByID', config.channelName, txId);

      const processedTransactionByBlockDecoder = BlockDecoder.decodeTransaction(data);

      const processedTransaction = protos.protos.ProcessedTransaction.decode(data);

      logger.info('---> GetTransactionValidationCodeService - end < ---');
      return { processedTransactionByBlockDecoder, processedTransaction };
    } catch (err) {
      throw handleError(err);
    }
  }
}

export default GetTransactionValidationCodeService;
