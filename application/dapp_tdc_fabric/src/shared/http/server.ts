import * as bodyParser from 'body-parser';
import 'reflect-metadata';
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import cors from 'cors';
import routes from './routes';
import IdentityError from '../errors/IdentityError';
import { errors } from 'celebrate';
import { logger } from '../utils/logger';
import { buildWallet, loadConnectionProfile, createGateway, getNetwork, getContracts, checkAndInitIdentities } from '../utils/fabric';
import { createOrUpdateId } from '../../modules/idauth/helper/serviceHelper';
import * as config from '../../config/config';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import { IdentityAuth } from '../../modules/idauth/assets/idAuth';
import { Contract } from 'fabric-network';
import { isMaxmemoryPolicyNoeviction } from '../utils/redis';
import { Queue, QueueScheduler, Worker } from 'bullmq';
import { initJobQueue, initJobQueueScheduler, initJobQueueWorker } from '../utils/jobs';

const app = express();

app.use(cors());

app.use(express.json());

app.use(routes);

app.use(errors());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: Error, request: Request, response: Response, next: NextFunction) => {
  if (error instanceof IdentityError) {
    return response.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      stack: config.logLevel === 'debug' ? error.stack : undefined,
      txId: error.txId,
    });
  } else {
    return response.status(500).json({
      status: 'error',
      message: error.message,
      stack: config.logLevel === 'debug' ? error.stack : undefined,
    });
  }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let jobQueue: Queue | undefined;
let jobQueueWorker: Worker | undefined;
let jobQueueScheduler: QueueScheduler | undefined;

async function main() {
  logger.info('### Checking Redis config ####');
  if (!(await isMaxmemoryPolicyNoeviction())) {
    throw new Error('Invalid redis configuration: redis instance must have the setting maxmemory-policy=noeviction');
  }

  logger.info('#### Initialising submit job queue ####');
  jobQueue = initJobQueue();
  jobQueueWorker = initJobQueueWorker(app);
  if (config.submitJobQueueScheduler) {
    logger.info('#### Initialising submit job queue scheduler ####');
    jobQueueScheduler = initJobQueueScheduler();
  }
  app.locals.jobq = jobQueue;
  logger.info('#### END Initialising submit job queue ####');

  logger.info('### Verifying identities. ###');
  await checkAndInitIdentities();
  logger.info('### Done veryfying identities. ###');

  logger.info('### Starting up swagger ###');
  const swaggerFile: any = process.cwd() + '/swagger.json';
  const swaggerData: any = fs.readFileSync(swaggerFile, 'utf8');
  const customCss: any = fs.readFileSync(process.cwd() + '/swagger.css', 'utf8');
  const swaggerDocument = JSON.parse(swaggerData);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, undefined, undefined, customCss));

  logger.info('### Staring connection with Hyperledger Fabric network ###');
  const walletPath = config.walletPath;
  const ccp = loadConnectionProfile();
  logger.info('--- Connection profile loaded ---');
  const wallet = await buildWallet(walletPath);
  logger.info('--- Wallet created ---');
  const gateway = await createGateway(ccp, config.dappUser, wallet);
  logger.info('--- Gateway created ---');
  const network = await getNetwork(gateway);
  logger.info(`--- Network loaded ${config.orgName} ---`);
  const contracts = await getContracts(network);
  logger.info('--- Contracts loaded ---');
  app.locals[config.orgName] = contracts;

  logger.info('--- INIT Adding bootstrap user in the blockchain ledger ---');
  const idAuth: IdentityAuth = new IdentityAuth();
  idAuth.login = config.dappUser;
  idAuth.firstName = config.dappUser;
  idAuth.lastName = config.dappUser;
  idAuth.enrollmentId = config.dappUser;
  idAuth.enrollmentSecret = config.dappPwd;
  idAuth.hlfRole = 'client';
  idAuth.roles = [
    {
      name: 'identityAuthService',
      value: 'true',
      ecert: true,
    },
  ];
  idAuth.affiliation = config.dappDefaultAffiliation;
  const contract = app.locals[config.orgName]?.assetContract as Contract;
  try {
    const txId = await createOrUpdateId('createId', { contract, idAuth });
    logger.info(`--- User added to the chain with sucess: ${JSON.stringify(txId)}`);
  } catch (e) {
    logger.info('--- Unable to create user on the blockchain ledger. ---');
  }
  const txId = await createOrUpdateId('updateId', { contract, idAuth });
  logger.info(`--- User added  and updated to the chain with sucess: ${JSON.stringify(txId)}`);
  logger.info('--- END Adding bootstrap user in the blockchain ledger ---');
  app.listen(config.restServerPort, () => {
    logger.info(`Server started on port ${config.restServerPort}`);
  });
}

main().catch(async err => {
  logger.error({ err }, 'Unxepected error');

  if (jobQueueScheduler != undefined) {
    logger.debug('Closing job queue scheduler');
    await jobQueueScheduler.close();
  }

  if (jobQueueWorker != undefined) {
    logger.debug('Closing job queue worker');
    await jobQueueWorker.close();
  }

  if (jobQueue != undefined) {
    logger.debug('Closing job queue');
    await jobQueue.close();
  }
});
