import { Request, Response } from 'express';
import { Queue } from 'bullmq';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import JobSummaryService from '../services/JobSummaryService';
import { JobNotFoundError } from '../../../shared/utils/jobs';
import JobCountsService from '../services/JobCountsService';

const { NOT_FOUND, OK, INTERNAL_SERVER_ERROR, SERVICE_UNAVAILABLE } = StatusCodes;

export default class JobController {
  public async show(request: Request, response: Response): Promise<Response> {
    try {
      const regConSubmit = request.app.locals.jobq as Queue;
      const jobId = request.params.jobId;
      const jobSummaryService = new JobSummaryService();
      const jobSummary = await jobSummaryService.execute(regConSubmit, jobId);
      return response.status(OK).json(jobSummary);
    } catch (err) {
      if (err instanceof JobNotFoundError) {
        return response.status(NOT_FOUND).json({
          status: getReasonPhrase(NOT_FOUND),
          timestamp: new Date().toISOString(),
        });
      }
      return response.status(INTERNAL_SERVER_ERROR).json({
        status: getReasonPhrase(INTERNAL_SERVER_ERROR),
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async showJobCounts(request: Request, response: Response): Promise<Response> {
    try {
      const regConSubmit = request.app.locals.jobq as Queue;
      const jobCountsService = new JobCountsService();
      const jobCounts = await jobCountsService.execute(regConSubmit);
      return response.status(OK).json(jobCounts);
    } catch (err) {
      return response.status(SERVICE_UNAVAILABLE).json({
        status: getReasonPhrase(SERVICE_UNAVAILABLE),
        timestamp: new Date().toISOString(),
      });
    }
  }
}
