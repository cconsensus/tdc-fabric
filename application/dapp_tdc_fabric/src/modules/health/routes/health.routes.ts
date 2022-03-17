import { Response, Router } from 'express';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import HealthController from '../controller/HealthController';
import isAuthenticated from '../../../shared/middlewares/isAuthenticated';
import createFabricContractEndpointUserConnection from '../../../shared/middlewares/createFabricContractEndpointUserConnection';

const { OK } = StatusCodes;

const healthRouter = Router();

healthRouter.use(isAuthenticated);
healthRouter.use(createFabricContractEndpointUserConnection);

const healthController = new HealthController();

healthRouter.get('/ready/', (_req, res: Response) =>
  res.status(OK).json({
    status: getReasonPhrase(OK),
    timestamp: new Date().toISOString(),
  }),
);

healthRouter.get('/live/', healthController.health);

export default healthRouter;
