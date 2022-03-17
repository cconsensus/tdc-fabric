import { Contract } from 'fabric-network';
import { IKeyValueAttribute, IRegisterRequest } from 'fabric-ca-client';
import { hash } from 'bcryptjs';
import { IdentityAuth } from '../assets/idAuth';
import { logger } from '../../../shared/utils/logger';
import { submitTransaction } from '../../../shared/utils/fabric';
import { handleTXError } from '../../../shared/errors/error';
import * as config from '../../../config/config';
import { buildCAClient } from '../../../shared/utils/CAUtil';
import { buildWallet, loadConnectionProfile } from '../../../shared/utils/fabric';

interface IRequest {
  contract: Contract;
  idAuth: IdentityAuth;
}

/**
 * Create or update IT in the chain
 * @param operation
 * @param contract
 * @param idAuth
 */
export const createOrUpdateId = async (operation: string, { contract, idAuth }: IRequest): Promise<{ txId: string }> => {
  let txId = '';
  try {
    logger.info(`--> INIT createOrUpdate: ${idAuth.login}`);
    const transaction = contract.createTransaction(operation);

    const pwd = {
      enrollmentSecretHash: Buffer.from(await hash(idAuth.enrollmentSecret, 8)),
    };

    transaction.setTransient(pwd);
    txId = transaction.getTransactionId();
    await submitTransaction(
      transaction,
      idAuth.login,
      idAuth.firstName,
      idAuth.lastName,
      idAuth.enrollmentId,
      JSON.stringify(idAuth.roles),
      idAuth.hlfRole,
      idAuth.affiliation ? idAuth.affiliation : config.dappDefaultAffiliation,
    );

    const data = {
      txId: txId,
    };

    logger.info(`--> END createOrUpdate: ${idAuth.login} - txId ${txId}`);
    return data;
  } catch (err) {
    logger.error(`Error createOrUpdate ID: ${JSON.stringify(err)}`);
    throw handleTXError(txId, err);
  }
};

/**
 * Service to update user inside Fabric Certificate Authority.
 * Aditional attributes to the identity may be passed by IdentityAuth.roles as an array.
 * @see FabricCaServices.IKeyValueAttribute:
 * {
 *   name:string,
 *   value:string,
 *   ecert:true
 * }
 * @param create
 * @param idAuth
 */
export const createOrUpdateCAId = async (create: boolean, idAuth: IdentityAuth): Promise<string> => {
  logger.info(`--> INIT createOrUpdateCAId: create: ${create} - ${idAuth.login}`);
  const caHostName = config.caHostName;
  const wallet = await buildWallet(config.walletPath);
  const ccp = loadConnectionProfile();
  const caClient = buildCAClient(ccp, caHostName);
  const identityServices = caClient.newIdentityService();
  const registarUser = await wallet.get(config.registarUser);

  if (!registarUser) {
    throw new Error(`Unable to find ${config.registarUser} enrolled on wallet!`);
  }
  const provider = wallet.getProviderRegistry().getProvider(registarUser.type);
  const registrar = await provider.getUserContext(registarUser, config.registarUser);

  const attrs: IKeyValueAttribute[] = [];

  attrs.push(...(idAuth.roles as IKeyValueAttribute[]));

  const attrFistname: IKeyValueAttribute = {
    name: 'firstName',
    value: idAuth.firstName,
    ecert: true,
  };
  attrs.push(attrFistname);
  const attrLastName: IKeyValueAttribute = {
    name: 'lastName',
    value: idAuth.lastName,
    ecert: true,
  };
  attrs.push(attrLastName);
  const attrLogin: IKeyValueAttribute = {
    name: 'login',
    value: idAuth.login,
    ecert: true,
  };
  attrs.push(attrLogin);

  const req: IRegisterRequest = {
    affiliation: idAuth.affiliation ? idAuth.affiliation : config.dappDefaultAffiliation,
    enrollmentID: idAuth.enrollmentId,
    role: 'client',
    maxEnrollments: 0,
    enrollmentSecret: idAuth.enrollmentSecret,
    attrs: attrs,
  };

  if (create) {
    await identityServices.create(req, registrar);
    logger.info(`--> createOrUpdateCAId Identity created: ${idAuth.enrollmentId}`);
  } else {
    await identityServices.update(idAuth.enrollmentId, req, registrar);
    logger.info(`--> createOrUpdateCAId Identity updated: ${idAuth.enrollmentId}`);
  }

  req.enrollmentSecret = '';

  logger.info(`--> END createOrUpdateCAId: ${idAuth.login}`);
  return JSON.parse(JSON.stringify(req, null, 2));
};
