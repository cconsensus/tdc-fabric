/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Contract, DefaultEventHandlerStrategies, DefaultQueryHandlerStrategies, Gateway, GatewayOptions, Wallets, Network, Transaction, Wallet } from 'fabric-network';
import * as config from '../../config/config';
import { logger } from './logger';
import { handleTXError } from '../errors/error';
import { buildCAClient, enrollUser, registerUser } from './CAUtil';

import * as protos from 'fabric-protos';
import path from 'path';
import fs from 'fs';

export const loadConnectionProfile = (): Record<string, any> => {
  const ccpPath = path.join(process.cwd(), config.connectionProfilePath);
  console.log(`#Connection profile path: ${ccpPath}`);
  const fileExists = fs.existsSync(ccpPath);
  if (!fileExists) {
    throw new Error(`no such file or directory: ${ccpPath}`);
  }
  const contents = fs.readFileSync(ccpPath, 'utf8');
  const ccp = JSON.parse(contents);
  console.log(`Loaded the network configuration located at ${ccpPath}`);
  return ccp;
};

export const buildWallet = async (walletPath: string): Promise<Wallet> => {
  // Create a new  wallet : Note that wallet is for managing identities.
  let wallet: Wallet;
  if (walletPath) {
    wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Built a file system wallet at ${walletPath}`);
  } else {
    wallet = await Wallets.newInMemoryWallet();
    console.log('Built an in memory wallet');
  }
  return wallet;
};

/**
 * Do the initial identity setup.
 * @todo need best thinking about this process
 */
export const checkAndInitIdentities = async (): Promise<void> => {
  const dappUser = config.dappUser;
  const dappPwd = config.dappPwd;
  const caHostName = config.caHostName;
  const orgName = config.orgName;
  const wallet = await buildWallet(config.walletPath);
  const dappSystemUser = await wallet.get(dappUser);

  if (dappSystemUser) {
    console.info(`DAPP system user: ${JSON.stringify(dappSystemUser)} already enrolled!`);
    console.info('If you are getting ssl error, try deleting wallet directory');
    return;
  }

  const ccp = loadConnectionProfile();
  const caClient = buildCAClient(ccp, caHostName);
  await registerUser(caClient, wallet, orgName, dappUser, '', dappPwd, [
    {
      name: 'identityAuthService',
      value: 'true',
      ecert: true,
    },
  ]);

  await enrollUser(caClient, wallet, orgName, dappUser, dappPwd, [
    {
      name: 'identityAuthService',
      optional: false,
    },
  ]);

  console.log(`User ${dappUser} registered and enrolled with success on ${caClient.getCaName()}!!`);
};

/*
 * Create a Gateway connection
 *
 * Gateway instances can and should be reused rather than connecting to submit every transaction
 */
export const createGateway = async (connectionProfile: Record<string, unknown>, identity: string, wallet: Wallet): Promise<Gateway> => {
  logger.debug({ connectionProfile, identity }, 'Configuring gateway');

  const gateway = new Gateway();

  const options: GatewayOptions = {
    wallet,
    identity,
    discovery: { enabled: true, asLocalhost: config.asLocalHost },
    eventHandlerOptions: {
      commitTimeout: config.commitTimeOut,
      endorseTimeout: config.endorseTimeOut,
      strategy: DefaultEventHandlerStrategies.PREFER_MSPID_SCOPE_ANYFORTX,
    },
    queryHandlerOptions: {
      timeout: config.queryTimeOut,
      strategy: DefaultQueryHandlerStrategies.PREFER_MSPID_SCOPE_ROUND_ROBIN,
    },
  };

  await gateway.connect(connectionProfile, options);

  return gateway;
};

/*
 * Get the network which the asset transfer sample chaincode is running on
 *
 * In addion to getting the contract, the network will also be used to
 * start a block event listener
 */
export const getNetwork = async (gateway: Gateway): Promise<Network> => {
  const network = await gateway.getNetwork(config.channelName);
  return network;
};

/*
 * Get the asset transfer sample contract and the qscc system contract
 *
 * The system contract is used for the liveness REST endpoint
 */
export const getContracts = async (network: Network): Promise<{ qsccContract: Contract; assetContract: Contract }> => {
  logger.info('--- getContracts INIT LOADING SMARTCONTRACTS ---');
  const assetContract = network.getContract(config.chaincodeName);
  const qsccContract = network.getContract('qscc');
  logger.info(`--> getContracts 1 - Chaincode ID: ${assetContract.chaincodeId}`);
  logger.info(`--> getContracts 2 - Chaincode ID: ${qsccContract.chaincodeId}`);
  logger.info('--- getContracts END LOADING SMARTCONTRACTS ---');
  return { assetContract, qsccContract };
};

/*
 * Evaluate a transaction and handle any errors
 */
export const evaluateTransaction = async (contract: Contract, transactionName: string, ...transactionArgs: string[]): Promise<Buffer> => {
  const transaction = contract.createTransaction(transactionName);
  const transactionId = transaction.getTransactionId();
  logger.trace({ transaction }, 'Evaluating transaction');

  try {
    const payload = await transaction.evaluate(...transactionArgs);
    logger.trace(
      {
        transactionId: transactionId,
        payload: payload.toString(),
      },
      'Evaluate transaction response received',
    );
    return payload;
  } catch (err) {
    throw handleTXError(transactionId, err);
  }
};

/*
 * Submit a transaction and handle any errors
 */
export const submitTransaction = async (transaction: Transaction, ...transactionArgs: string[]): Promise<Buffer> => {
  logger.trace({ transaction }, 'Submitting transaction');
  const txnId = transaction.getTransactionId();

  try {
    const payload = await transaction.submit(...transactionArgs);
    logger.trace({ transactionId: txnId, payload: payload.toString() }, 'Submit transaction response received');
    return payload;
  } catch (err) {
    throw handleTXError(txnId, err);
  }
};

/*
 * Get the validation code of the specified transaction
 */
export const getTransactionValidationCode = async (qsccContract: Contract, transactionId: string): Promise<string> => {
  const data = await evaluateTransaction(qsccContract, 'GetTransactionByID', config.channelName, transactionId);

  const processedTransaction = protos.protos.ProcessedTransaction.decode(data);
  const validationCode = protos.protos.TxValidationCode[processedTransaction.validationCode];

  logger.debug({ transactionId }, 'Validation code: %s', validationCode);
  return validationCode;
};

/*
 * Get the current block height
 *
 * This example of using a system contract is used for the liveness REST
 * endpoint
 */
export const getBlockHeight = async (qscc: Contract): Promise<number | Long.Long> => {
  const data = await qscc.evaluateTransaction('GetChainInfo', config.channelName);
  const info = protos.common.BlockchainInfo.decode(data);
  const blockHeight = info.height;

  logger.debug('Current block height: %d', blockHeight);
  return blockHeight;
};
