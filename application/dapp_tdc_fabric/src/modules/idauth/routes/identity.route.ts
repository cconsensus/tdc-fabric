import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import IdentityController from '../controller/IdentityController';
import isAuthenticated from '../../../shared/middlewares/isAuthenticated';
import createFabricContractEndpointUserConnection from '../../../shared/middlewares/createFabricContractEndpointUserConnection';

const identityRouter = Router();

identityRouter.use(isAuthenticated);
identityRouter.use(createFabricContractEndpointUserConnection);

const identityController = new IdentityController();

const completeCelebrateValidations = celebrate({
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
});

identityRouter.get(
  '/:login',
  celebrate({
    [Segments.PARAMS]: {
      login: Joi.string().email().required(),
    },
  }),
  identityController.show,
);

identityRouter.post(
  '/auth/',
  celebrate({
    [Segments.BODY]: {
      login: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  }),
  identityController.authenticate,
);

identityRouter.get(
  '/validate/:login',
  celebrate({
    [Segments.PARAMS]: {
      login: Joi.string().email().required(),
    },
  }),
  identityController.validate,
);

identityRouter.get(
  '/history/:login',
  celebrate({
    [Segments.PARAMS]: {
      login: Joi.string().email().required(),
    },
  }),
  identityController.showHistory,
);

identityRouter.get(
  '/listByOrg/:organization',
  celebrate({
    [Segments.PARAMS]: {
      organization: Joi.string().required(),
    },
  }),
  identityController.listByOrganization,
);

identityRouter.get(
  '/listByOrg/:organization/:pageSize/:bookmark',
  celebrate({
    [Segments.PARAMS]: {
      organization: Joi.string().required(),
      pageSize: Joi.string().required(),
      bookmark: Joi.string().required(),
    },
  }),
  identityController.listByOrganizationPaginated,
);

identityRouter.get(
  '/listByAffiliation/:affiliation',
  celebrate({
    [Segments.PARAMS]: {
      affiliation: Joi.string().required(),
    },
  }),
  identityController.listByAffiliation,
);

identityRouter.get(
  '/listByAffiliation/:affiliation/:pageSize/:bookmark',
  celebrate({
    [Segments.PARAMS]: {
      affiliation: Joi.string().required(),
      pageSize: Joi.string().required(),
      bookmark: Joi.string().required(),
    },
  }),
  identityController.listByAffiliationPaginated,
);

identityRouter.post('/', completeCelebrateValidations, identityController.create);

identityRouter.post('/async/', completeCelebrateValidations, identityController.createAsync);

identityRouter.put('/', completeCelebrateValidations, identityController.update);

identityRouter.put('/async/', completeCelebrateValidations, identityController.updateAsync);

export default identityRouter;
