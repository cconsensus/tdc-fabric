import { Queue } from 'bullmq';
import { logger } from '../../../shared/utils/logger';
import { getJobSummary, JobSummary } from '../../../shared/utils/jobs';
import { handleError } from '../../../shared/errors/error';

class JobSummaryService {
  public async execute(queue: Queue, jobId: string): Promise<JobSummary> {
    try {
      logger.info(`--> INIT  JobSummaryService - JobID: ${jobId} <---`);
      const jobSummary = await getJobSummary(queue, jobId);
      logger.info('--> END  JobSummaryService <---');
      return jobSummary;
    } catch (err) {
      throw handleError(err);
    }
  }
}

export default JobSummaryService;
