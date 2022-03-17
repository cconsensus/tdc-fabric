import { Request, Response } from 'express';
import { Queue } from 'bullmq';
import { StatusCodes } from 'http-status-codes';
import LivenessRequestService from '../services/LivenessRequestService';
import { Contract } from 'fabric-network';
import * as config from '../../../config/config';
import { handleError } from '../../../shared/errors/error';

const { OK } = StatusCodes;

export default class HealthController {
  public async health(request: Request, response: Response): Promise<Response> {
    try {
      const loggedUser = request.user.id;
      const regConSubmit = request.app.locals.jobq as Queue;
      const livenessRequestService = new LivenessRequestService();
      const contract: Contract = request.app.locals[config.orgName + loggedUser]?.qsccContract as Contract;
      const health = await livenessRequestService.execute(regConSubmit, contract);
      return response.status(OK).json(health);
    } catch (err) {
      throw handleError(err);
    }
  }
}
