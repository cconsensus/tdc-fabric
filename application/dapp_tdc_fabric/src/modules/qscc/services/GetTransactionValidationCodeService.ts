import { logger } from '../../../shared/utils/logger';
import { Contract } from 'fabric-network';
import { getTransactionValidationCode } from '../../../shared/utils/fabric';
import { handleError } from '../../../shared/errors/error';

interface IRequest {
  qsccContract: Contract;
  txId: string;
}

class GetTransactionValidationCodeService {
  public async execute({ qsccContract, txId }: IRequest): Promise<{ txValidationCode: string }> {
    try {
      logger.info(`---> GetTransactionValidationCodeService: ${txId} <---`);
      const txValidationCode = await getTransactionValidationCode(qsccContract, txId);
      const ret = {
        txValidationCode,
      };
      logger.info(`---> GetTransactionValidationCodeService - RegCon: ${txValidationCode}`);
      logger.info('---> GetTransactionValidationCodeService - end < ---');
      return ret;
    } catch (err) {
      throw handleError(err);
    }
  }
}

export default GetTransactionValidationCodeService;
