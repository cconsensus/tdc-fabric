import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import SessionsController from '../controller/SessionsController';

const sessionsRouter = Router();
const sessionsController = new SessionsController();

sessionsRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      login: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  }),

  sessionsController.create,
);

export default sessionsRouter;
