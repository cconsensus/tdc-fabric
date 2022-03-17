import IdentityError from '../errors/IdentityError';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import authConfig from '../../config/auth';
import { logger } from '../utils/logger';

export default function isAuthenticated(request: Request, response: Response, next: NextFunction): void {
  logger.info('--- INIT isAuthenticated ---');
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    logger.info('--- JWT error: authHeader not found. ---');
    throw new IdentityError('JWT Token does not exists', 401);
  } else {
    // Bearer token
    const tokenJWT = authHeader.split(' ');
    const token = tokenJWT[1];
    if (!authConfig.jwt.secret) {
      throw new IdentityError('Unable to find JWT security token', 401);
    }
    verify(token, authConfig.jwt.secret, (err, decoded) => {
      if (err) {
        logger.info(`--- JWT error: ${JSON.stringify(err, null, 2)} ---`);
        throw new IdentityError(err.name + '-' + err.message, 401, err.stack);
      }
      console.log(decoded);
      if (!decoded?.sub) {
        throw new IdentityError('Unable to find JWT security token', 401);
      }
      const sub: string = decoded?.sub as string;
      console.log(sub);

      request.user = {
        id: sub,
      };
    });
    logger.info('--- END isAuthenticated ---');
    return next();
  }
}
