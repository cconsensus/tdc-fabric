import IdentityError from '../errors/IdentityError';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { buildWallet, createGateway, getContracts, getNetwork, loadConnectionProfile } from '../utils/fabric';
import * as config from '../../config/config';

export default async function createFabricContractEndpointUserConnection(request: Request, response: Response, next: NextFunction): Promise<void> {
  logger.info('--- INIT createFabricContractEndpointUserConnection ---');
  try {
    const loggedUser = request.user.id;
    if (!loggedUser) {
      throw new IdentityError('Unable to find logged user in request!', 401);
    }
    let userContracts = request.app.locals[config.orgName + loggedUser];
    if (!userContracts) {
      // create contracts endpoints.
      const walletPath = config.walletPath;
      const ccp = loadConnectionProfile();
      logger.info('--- Connection profile loaded ---');
      const wallet = await buildWallet(walletPath);
      logger.info('--- Wallet created ---');
      const gateway = await createGateway(ccp, loggedUser, wallet);
      const network = await getNetwork(gateway);
      logger.info(`--- Network loaded ${config.orgName} ---`);
      userContracts = await getContracts(network);
      logger.info('--- Contracts loaded ---');
      request.app.locals[config.orgName + loggedUser] = userContracts;
    }
    next();
  } catch (error) {
    next(error);
  }
  logger.info('--- end createFabricContractEndpointUserConnection ---');
}
