import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import IdentityCAController from '../controller/IdentityCAController';
import isAuthenticated from '../../../shared/middlewares/isAuthenticated';

const identityCARouter = Router();

identityCARouter.use(isAuthenticated);

const identityCAController = new IdentityCAController();

identityCARouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      login: Joi.string().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      enrollmentId: Joi.string().required(),
      enrollmentSecret: Joi.string().required(),
      roles: Joi.array().optional(),
      hlfRole: Joi.string().required(),
      affiliation: Joi.string().optional(),
    },
  }),
  identityCAController.create,
);

identityCARouter.put(
  '/',
  celebrate({
    [Segments.BODY]: {
      login: Joi.string().email().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      enrollmentId: Joi.string().required(),
      enrollmentSecret: Joi.string().required(),
      roles: Joi.array().optional(),
      hlfRole: Joi.string().required(),
      affiliation: Joi.string().optional(),
    },
  }),
  identityCAController.update,
);

identityCARouter.get('/listAllIds', identityCAController.listAllCAIdentities);

identityCARouter.get(
  '/getCAIdentity/:enrollmentId',
  celebrate({
    [Segments.PARAMS]: {
      enrollmentId: Joi.string().required(),
    },
  }),
  identityCAController.getCAIdentity,
);

identityCARouter.post(
  '/enroll',
  celebrate({
    [Segments.BODY]: {
      login: Joi.string().email().required(),
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      enrollmentId: Joi.string().optional(),
      enrollmentSecret: Joi.string().required(),
      roles: Joi.array().optional(),
      hlfRole: Joi.string().optional(),
      affiliation: Joi.string().optional(),
    },
  }),
  identityCAController.enrollIdentity,
);

export default identityCARouter;
