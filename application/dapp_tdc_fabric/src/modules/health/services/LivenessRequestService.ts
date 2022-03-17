import { Queue } from 'bullmq';
import { logger } from '../../../shared/utils/logger';
import { getJobCounts } from '../../../shared/utils/jobs';
import { handleError } from '../../../shared/errors/error';
import { evaluateTransaction } from '../../../shared/utils/fabric';
import * as config from '../../../config/config';
import * as protos from 'fabric-protos';
import { Contract } from 'fabric-network';

class LivenessRequestService {
  public async execute(queue: Queue, qsccContract: Contract): Promise<{ blockchainInfo: protos.common.BlockchainInfo; jobInfo: { [p: string]: number }; timestamp: string }> {
    try {
      logger.info('--> INIT  LivenessRequestService <---');
      const jobInfo = await getJobCounts(queue);
      const blockData = await evaluateTransaction(qsccContract, 'GetChainInfo', config.channelName);
      const blockchainInfo = protos.common.BlockchainInfo.decode(blockData);
      const ret = {
        jobInfo,
        blockchainInfo,
        timestamp: new Date().toISOString(),
      };
      logger.info('--> END  LivenessRequestService <---');
      return ret;
    } catch (err) {
      throw handleError(err);
    }
  }
}

export default LivenessRequestService;
