import { Queue } from 'bullmq';
import { logger } from '../../../shared/utils/logger';
import { getJobCounts } from '../../../shared/utils/jobs';
import { handleError } from '../../../shared/errors/error';

class JobCountsService {
  public async execute(queue: Queue): Promise<{ [index: string]: number }> {
    try {
      logger.info('--> INIT  JobCountsService <---');
      const jobCounts = await getJobCounts(queue);
      logger.info('--> END  JobCountsService <---');
      return jobCounts;
    } catch (err) {
      throw handleError(err);
    }
  }
}

export default JobCountsService;
