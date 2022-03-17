import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import TokenController from '../controller/TokenController';
import isAuthenticated from '../../../shared/middlewares/isAuthenticated';
import createFabricContractEndpointUserConnection from '../../../shared/middlewares/createFabricContractEndpointUserConnection';

const tokenRouter = Router();

tokenRouter.use(isAuthenticated);
tokenRouter.use(createFabricContractEndpointUserConnection);

const tokenController = new TokenController();

tokenRouter.get(
  '/:owner',
  celebrate({
    [Segments.PARAMS]: {
      owner: Joi.string().email().required(),
    },
  }),
  tokenController.show,
);

tokenRouter.get(
  '/history/:owner',
  celebrate({
    [Segments.PARAMS]: {
      owner: Joi.string().email().required(),
    },
  }),
  tokenController.showHistory,
);

tokenRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      owner: Joi.string().email().required(),
    },
  }),
  tokenController.init,
);

tokenRouter.patch(
  '/addTokens',
  celebrate({
    [Segments.BODY]: {
      owner: Joi.string().email().required(),
      value: Joi.number().positive().required(),
    },
  }),
  tokenController.addTokens,
);

tokenRouter.patch(
  '/subtractTokens',
  celebrate({
    [Segments.BODY]: {
      owner: Joi.string().email().required(),
      value: Joi.number().positive().required(),
    },
  }),
  tokenController.subtractTokens,
);

export default tokenRouter;
