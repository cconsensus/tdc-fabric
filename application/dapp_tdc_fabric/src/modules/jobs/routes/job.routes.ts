import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import isAuthenticated from '../../../shared/middlewares/isAuthenticated';
import JobController from '../controller/JobController';
import createFabricContractEndpointUserConnection from '../../../shared/middlewares/createFabricContractEndpointUserConnection';

const jobRouter = Router();
jobRouter.use(isAuthenticated);
jobRouter.use(createFabricContractEndpointUserConnection);

const jobController = new JobController();

jobRouter.get(
  '/:jobId',
  celebrate({
    [Segments.PARAMS]: {
      jobId: Joi.string().required(),
    },
  }),
  jobController.show,
);

jobRouter.get('/count/get', jobController.showJobCounts);

export default jobRouter;
