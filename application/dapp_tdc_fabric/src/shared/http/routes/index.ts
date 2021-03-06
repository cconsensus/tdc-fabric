import { Router } from 'express';
import identityRouter from '../../../modules/idauth/routes/identity.route';
import sessionsRouter from '../../../modules/idauth/routes/session.routes';
import identityCARouter from '../../../modules/idauth/routes/identityca.route';
import healthRouter from '../../../modules/health/routes/health.routes';
import jobRouter from '../../../modules/jobs/routes/job.routes';
import tokenRouter from '../../../modules/token/routes/token.route';
import qsccRouter from '../../../modules/qscc/routes/qscc.routes';

const routes = Router();

routes.use('/identity/', identityRouter);
routes.use('/identity/ca/', identityCARouter);
routes.use('/auth/', sessionsRouter);
routes.use('/jobs/', jobRouter);
routes.use('/health/', healthRouter);
routes.use('/tokenAccount/', tokenRouter);
routes.use('/qscc/', qsccRouter);

routes.get('/', (request, response) => {
  return response.json({ message: 'MIGUEL ELIAS FAULSTICH DINIZ REIS' });
});

export default routes;
