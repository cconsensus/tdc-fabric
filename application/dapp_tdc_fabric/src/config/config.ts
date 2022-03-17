import 'dotenv/config';
import * as env from 'env-var';

/*
 * Log config level.
 */
export const logLevel = env.get('LOG_LEVEL').default('info').asEnum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']);

/*
 * Organization name of this dapp / rest / api server.
 */
export const orgName = env.get('ORG_NAME').default('Org1MSP').example('Org1MSP').asString();

/*
 * CA Hostname
 */
export const caHostName = env.get('ORG_CA_HOSTNAME').default('ca.org1.example.com').example('ca.org1.example.com').asString();

/*
 * Wallet path
 */
export const walletPath = env.get('WALLETS_BASE_PATH').default('wallets').example('wallets').asString() + '/' + orgName;

/*
 * Hyperledger connection profile path
 */
export const connectionProfilePath = env
  .get('CONNECTION_PROFILE_PATH')
  .default('connection/connection-org1-org2-org3.json')
  .example('connection/connection-org1-org2-org3.json')
  .asString();

/*
 * Fabric CA registar username
 */
export const registarUser = env.get('REGISTAR_USER').default('admin').example('admin').asString();

/*
 * Fabric CA registar pass
 */
export const registarPass = env.get('REGISTAR_PASS').default('adminpw').example('adminpw').asString();

/*
 * APP Secret for JWT
 */
export const appSecret = env.get('APP_JWT_SECRET').default('appSecret').example('appSecret').asString();

/*
 * APP Secret for JWT
 */
export const dappDefaultAffiliation = env.get('APP_DEFAULT_AFFILIATION').default('org1.department1').example('org1.department1').asString();

/*
 * Hyperledger fabric username connection.
 */
export const dappUser = env.get('DAPP_USER').default('dappUser').example('dappUser').asString();

/*
 * Hyperledger fabric username connection.
 */
export const dappPwd = env.get('DAPP_PASSWORD').default('dappUser').example('dappUser').asString();

/*
 * Chaincode package ID
 */
export const chaincodeID = env.get('CC_ID').default('br.com.cconsensus.regcon').example('br.com.cconsensus.regcon').asString();

/*
 * Chaincode name
 */
export const chaincodeName = env.get('CC_NAME').default('regcon').example('regcon').asString();

/*
 * Hyperledger fabric dapp channel
 */
export const channelName = env.get('CHANNEL').default('mychannel').example('mychannel').asString();

/*
 * Hyperledger query timeout.
 */
export const queryTimeOut = env.get('QUERY_TIMEOUT').default('300').example('300').asIntPositive();

/*
 * Hyperledger commit timeout.
 */
export const commitTimeOut = env.get('COMMIT_TMEOUT').default('300').example('300').asIntPositive();

/*
 * Hyperledger endorse timeout.
 */
export const endorseTimeOut = env.get('ENDORSE_TIMEOUT').default('300').example('300').asIntPositive();

/*
 * Hyperledger connection as localhost or remote (false).
 */
export const asLocalHost = env.get('AS_LOCALHOST').default('false').asBoolStrict();

/*
 * Hyperledger rest server tcp port
 */
export const restServerPort = env.get('TCP_PORT').default('8080').example('8080').asIntPositive();

/**
 * Redis host
 */
export const dappRedisHost = env.get('REDIS_HOST').default('localhost').example('192.168.33.20').asString();

/**
 * Redis server port
 */
export const dappRedisPort = env.get('REDIS_PORT').default('6379').example('6379').asPortNumber();

/**
 * Redis user service
 */
export const dappRedisUsername = env.get('REDIS_USERNAME').example('regcon').asString();

/**
 * Redis password
 */
export const dappRedisPassword = env.get('REDIS_PASSWORD').default('regcon').example('regcon').asString();

/**
 * JOBs queue name
 */
export const dappJobQueueName = env.get('JOB_QUEUE_NAME').default('submit').example('submit').asString();

/**
 * The type of backoff to use for retrying failed submit jobs
 */
export const submitJobBackoffType = env.get('SUBMIT_JOB_BACKOFF_TYPE').default('fixed').asEnum(['fixed', 'exponential']);

/**
 * Backoff delay for retrying failed submit jobs in milliseconds
 */
export const submitJobBackoffDelay = env.get('SUBMIT_JOB_BACKOFF_DELAY').default('3000').example('3000').asIntPositive();

/**
 * The total number of attempts to try a submit job until it completes
 */
export const submitJobAttempts = env.get('SUBMIT_JOB_ATTEMPTS').default('5').example('5').asIntPositive();

/**
 * The maximum number of submit jobs that can be processed in parallel
 */
export const submitJobConcurrency = env.get('SUBMIT_JOB_CONCURRENCY').default('5').example('5').asIntPositive();

/**
 * The number of completed submit jobs to keep
 */
export const maxCompletedSubmitJobs = env.get('MAX_COMPLETED_SUBMIT_JOBS').default('1000').example('1000').asIntPositive();

/**
 * The number of failed submit jobs to keep
 */
export const maxFailedSubmitJobs = env.get('MAX_FAILED_SUBMIT_JOBS').default('1000').example('1000').asIntPositive();

/**
 * Whether to initialise a scheduler for the submit job queue
 * There must be at least on queue scheduler to handle retries and you may want
 * more than one for redundancy
 */
export const submitJobQueueScheduler = env.get('SUBMIT_JOB_QUEUE_SCHEDULER').default('true').example('true').asBoolStrict();
