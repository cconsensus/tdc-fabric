import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import QsccController from '../controller/QsccController';
import isAuthenticated from '../../../shared/middlewares/isAuthenticated';
import createFabricContractEndpointUserConnection from '../../../shared/middlewares/createFabricContractEndpointUserConnection';

const qsccRouter = Router();
qsccRouter.use(isAuthenticated);
qsccRouter.use(createFabricContractEndpointUserConnection);
const qsccController = new QsccController();

qsccRouter.get(
  '/:txId',
  celebrate({
    [Segments.PARAMS]: {
      txId: Joi.string().required(),
    },
  }),
  qsccController.showTransaction,
);

qsccRouter.get(
  '/block/:txId',
  celebrate({
    [Segments.PARAMS]: {
      txId: Joi.string().required(),
    },
  }),
  qsccController.showBlockByTxId,
);

qsccRouter.get(
  '/block/number/:blockNumber',
  celebrate({
    [Segments.PARAMS]: {
      blockNumber: Joi.string().required(),
    },
  }),
  qsccController.showBlockByNumber,
);

qsccRouter.get(
  '/block/hash/:hash',
  celebrate({
    [Segments.PARAMS]: {
      hash: Joi.string().required(),
    },
  }),
  qsccController.showBlockByHash,
);

qsccRouter.get(
  '/validationcode/:txId',
  celebrate({
    [Segments.PARAMS]: {
      txId: Joi.string().required(),
    },
  }),
  qsccController.showTxValidationCode,
);

qsccRouter.get('/chaininfo/get', qsccController.showChainInfo);

export default qsccRouter;
