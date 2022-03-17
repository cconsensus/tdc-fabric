/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * This sample uses BullMQ jobs to process submit transactions, which includes
 * retry support for failing jobs
 */

import { ConnectionOptions, Job, Queue, QueueScheduler, Worker } from 'bullmq';
import { Application } from 'express';
import { Contract, Transaction, TransientMap } from 'fabric-network';
import * as config from '../../config/config';
import { getRetryAction, RetryAction } from '../errors/error';
import { logger } from './logger';
import { submitTransaction } from './fabric';

export type JobData = {
  jobUser: string;
  transactionName: string;
  transactionArgs: string[];
  transactionState?: Buffer;
  transactionIds: string[];
  transientUserHashSecretData?: TransientMap;
};

export type JobResult = {
  transactionPayload?: {
    txId: string;
    payload?: Buffer;
  };
  transactionError?: string;
};

export type JobSummary = {
  jobId: string;
  transactionIds: string[];
  transactionPayload?: string;
  transactionError?: string;
  returnValue?: any;
  transactionName?: string;
  transactionArgs?: string[];
  transientUserHashSecretData?: TransientMap;
};

export class JobNotFoundError extends Error {
  jobId: string;

  constructor(message: string, jobId: string) {
    super(message);
    Object.setPrototypeOf(this, JobNotFoundError.prototype);

    this.name = 'JobNotFoundError';
    this.jobId = jobId;
  }
}

const connection: ConnectionOptions = {
  port: config.dappRedisPort,
  host: config.dappRedisHost,
  username: config.dappRedisUsername,
  password: config.dappRedisPassword,
};

/**
 * Set up the queue for submit jobs
 */
export const initJobQueue = (): Queue => {
  const submitQueue = new Queue(config.dappJobQueueName, {
    connection,
    defaultJobOptions: {
      attempts: config.submitJobAttempts,
      backoff: {
        type: config.submitJobBackoffType,
        delay: config.submitJobBackoffDelay,
      },
      removeOnComplete: config.maxCompletedSubmitJobs,
      removeOnFail: config.maxFailedSubmitJobs,
    },
  });

  return submitQueue;
};

/**
 * Set up a worker to process submit jobs on the queue, using the
 * processSubmitTransactionJob function below
 */
export const initJobQueueWorker = (app: Application): Worker => {
  const worker = new Worker<JobData, JobResult>(
    config.dappJobQueueName,
    async (job): Promise<JobResult> => {
      return await processSubmitTransactionJob(app, job);
    },
    { connection, concurrency: config.submitJobConcurrency },
  );

  worker.on('failed', job => {
    logger.warn({ job }, 'Job failed');
  });

  // Important: need to handle this error otherwise worker may stop
  // processing jobs
  worker.on('error', err => {
    logger.error({ err }, 'Worker error');
  });

  if (logger.isLevelEnabled('debug')) {
    worker.on('completed', job => {
      logger.debug({ job }, 'Job completed');
    });
  }

  return worker;
};

/**
 * Process a submit transaction request from the job queue
 *
 * The job will be retried if this function throws an error
 */
export const processSubmitTransactionJob = async (app: Application, job: Job<JobData, JobResult>): Promise<JobResult> => {
  logger.debug({ jobId: job.id, jobName: job.name }, 'Processing job');

  const contract: Contract = app.locals[config.orgName]?.assetContract as Contract;

  if (contract === undefined) {
    logger.error({ jobId: job.id, jobName: job.name }, 'Contract not found for user %s', job.data.jobUser);

    // Retrying will never work without a contract, so give up with an
    // empty job result
    return {
      transactionError: undefined,
      transactionPayload: undefined,
    };
  }

  const args = job.data.transactionArgs;
  let transaction: Transaction;

  if (job.data.transactionState) {
    const savedState = job.data.transactionState;
    logger.debug(
      {
        jobId: job.id,
        jobName: job.name,
        savedState,
      },
      'Reusing previously saved transaction state',
    );

    transaction = contract.deserializeTransaction(savedState);
  } else {
    logger.debug(
      {
        jobId: job.id,
        jobName: job.name,
      },
      'Using new transaction',
    );

    transaction = contract.createTransaction(job.data.transactionName);
    await updateJobData(job, transaction);
  }

  logger.debug(
    {
      jobId: job.id,
      jobName: job.name,
      transactionId: transaction.getTransactionId(),
    },
    'Submitting transaction',
  );

  try {
    if (job.data.transientUserHashSecretData) {
      const pwd: TransientMap = job.data.transientUserHashSecretData as TransientMap;
      const pwdStr = JSON.stringify(pwd);
      const pJson: { enrollmentSecretHash: { type: string; data: Buffer } } = JSON.parse(pwdStr) as { enrollmentSecretHash: { type: string; data: Buffer } };
      const transientParam = {
        enrollmentSecretHash: pJson.enrollmentSecretHash.data,
      };
      transaction.setTransient(transientParam);
    }
    const payload = await submitTransaction(transaction, ...args);
    return {
      transactionPayload: { txId: transaction.getTransactionId(), payload },
      transactionError: undefined,
    };
  } catch (err) {
    const retryAction = getRetryAction(err);

    if (retryAction === RetryAction.None) {
      logger.error({ jobId: job.id, jobName: job.name, err }, 'Fatal transaction error occurred');

      // Not retriable so return a job result with the error details
      return {
        transactionError: `${err}`,
        transactionPayload: undefined,
      };
    }

    logger.warn({ jobId: job.id, jobName: job.name, err }, 'Retryable transaction error occurred');

    if (retryAction === RetryAction.WithNewTransactionId) {
      logger.debug({ jobId: job.id, jobName: job.name }, 'Clearing saved transaction state');
      await updateJobData(job, undefined);
    }

    // Rethrow the error to keep retrying
    throw err;
  }
};

/**
 * Set up a scheduler for the submit job queue
 *
 * This manages stalled and delayed jobs and is required for retries with backoff
 */
export const initJobQueueScheduler = (): QueueScheduler => {
  const queueScheduler = new QueueScheduler(config.dappJobQueueName, {
    connection,
  });

  queueScheduler.on('failed', (jobId, failedReason) => {
    logger.error({ jobId, failedReason }, 'Queue sceduler failure');
  });

  return queueScheduler;
};

/**
 * Helper to add a new submit transaction job to the queue
 */
export const addSubmitTransactionJob = async (
  submitQueue: Queue<JobData, JobResult>,
  jobUser: string,
  transactionName: string,
  transientUserHashSecretData?: TransientMap,
  ...transactionArgs: string[]
): Promise<string> => {
  const jobName = `submit ${transactionName} transaction`;
  const job = await submitQueue.add(jobName, {
    jobUser,
    transactionName,
    transientUserHashSecretData,
    transactionArgs: transactionArgs,
    transactionIds: [],
  });

  if (job?.id === undefined) {
    throw new Error('Submit transaction job ID not available');
  }

  return job.id;
};

/**
 * Helper to update the data for an existing job
 */
export const updateJobData = async (job: Job<JobData, JobResult>, transaction: Transaction | undefined): Promise<void> => {
  const newData = { ...job.data };

  if (transaction != undefined) {
    const transationIds = ([] as string[]).concat(newData.transactionIds, transaction.getTransactionId());
    newData.transactionIds = transationIds;

    newData.transactionState = transaction.serialize();
  } else {
    newData.transactionState = undefined;
  }

  await job.update(newData);
};

/**
 * Gets a job summary
 *
 * This function is used for the jobs REST endpoint
 */
export const getJobSummary = async (queue: Queue, jobId: string): Promise<JobSummary> => {
  const job: Job<JobData, JobResult> | undefined = await queue.getJob(jobId);
  logger.debug({ job }, 'Got job');

  if (!(job && job.id != undefined)) {
    throw new JobNotFoundError(`Job ${jobId} not found`, jobId);
  }
  let transactionName: string;
  let transactionArgs: string[];
  let transactionIds: string[];
  if (job.data && job.data.transactionIds) {
    transactionIds = job.data.transactionIds;
  } else {
    transactionIds = [];
  }

  if (job.data && job.data.transactionName) {
    transactionName = job.data.transactionName;
  } else {
    transactionName = '';
  }

  if (job.data && job.data.transactionArgs) {
    transactionArgs = job.data.transactionArgs;
  } else {
    transactionArgs = [];
  }

  let transactionError;
  let transactionPayload;
  const returnValue = job.returnvalue;
  if (returnValue) {
    if (returnValue.transactionError) {
      transactionError = returnValue.transactionError;
    }

    if (returnValue.transactionPayload && returnValue.transactionPayload.payload && returnValue.transactionPayload.payload.length > 0) {
      transactionPayload = returnValue.transactionPayload.payload.toString();
    } else {
      transactionPayload = '';
    }
  }

  const jobSummary: JobSummary = {
    jobId: job.id,
    transactionIds,
    transactionError,
    transactionPayload,
    returnValue,
    transactionName,
    transactionArgs,
  };

  return jobSummary;
};

/**
 * Get the current job counts
 *
 * This function is used for the liveness REST endpoint
 */
export const getJobCounts = async (queue: Queue): Promise<{ [index: string]: number }> => {
  const jobCounts = await queue.getJobCounts('active', 'completed', 'delayed', 'failed', 'waiting');
  logger.debug({ jobCounts }, 'Current job counts');

  return jobCounts;
};
