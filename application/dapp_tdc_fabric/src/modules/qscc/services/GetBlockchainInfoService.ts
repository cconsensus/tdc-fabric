import { logger } from '../../../shared/utils/logger';
import * as config from '../../../config/config';
import { Contract } from 'fabric-network';
import { evaluateTransaction } from '../../../shared/utils/fabric';
import { handleError } from '../../../shared/errors/error';
import * as protos from 'fabric-protos';

interface IRequest {
  qsccContract: Contract;
}

class GetBlockChainInfoService {
  public async execute({ qsccContract }: IRequest): Promise<any> {
    try {
      logger.info('---> GetBlockChainInfoService  INIT <---');
      const data = await evaluateTransaction(qsccContract, 'GetChainInfo', config.channelName);
      const blockProto = protos.common.BlockchainInfo.decode(data);
      logger.info('--> GetBlockChainInfoService  END <---');
      return blockProto;
    } catch (err) {
      throw handleError(err);
    }
  }
}

export default GetBlockChainInfoService;
