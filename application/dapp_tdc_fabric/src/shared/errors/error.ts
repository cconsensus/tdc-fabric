import { TimeoutError, TransactionError } from 'fabric-network';
import { logger } from '../utils/logger';
import IdentityError from './IdentityError';

export const isErrorLike = (err: unknown): err is Error => {
  return err != undefined && ((err as Error).stack === undefined || true);
};

export const handleTXError = (transactionId: string, err: unknown): Error | unknown => {
  logger.debug({ transactionId: transactionId, err }, 'Processing error');

  if (isErrorLike(err)) {
    const error = new IdentityError(`Error: ${transactionId} - ${err.message}`, 400, err.stack, transactionId);
    return error;
  }

  if (err instanceof Error) {
    const error = new IdentityError(`Error: ${err.message}`, 400, err.stack, transactionId);
    return error;
  }

  const error = new IdentityError(`Error: ${transactionId} - ${err}`, 400, undefined, transactionId);
  return error;
};

export const handleError = (err: unknown): Error | unknown => {
  logger.debug({ err }, 'Processing error');

  if (err instanceof Error) {
    const error = new IdentityError(err.message, 400, err.stack);
    return error;
  }
  const error = new IdentityError(`Error: ${JSON.stringify(err)}`, 400);
  return error;
};

/**
 * Enumeration of possible retry actions.
 */
export enum RetryAction {
  /**
   * Transactions should be retried using the same transaction ID to protect
   * against duplicate transactions being committed if a timeout error occurs
   */
  WithExistingTransactionId,

  /**
   * Transactions which could not be committed due to other errors require a
   * new transaction ID when retrying
   */
  WithNewTransactionId,

  /**
   * Transactions that failed due to a duplicate transaction error, or errors
   * from the smart contract, should not be retried
   */
  None,
}

/**
 * Get the required transaction retry action for an error.
 *
 * For this sample transactions are considered retriable if they fail with any
 * error, *except* for duplicate transaction errors, or errors from the smart
 * contract.
 *
 * You might decide to retry transactions which fail with specific errors
 * instead, for example:
 *   - MVCC_READ_CONFLICT
 *   - PHANTOM_READ_CONFLICT
 *   - ENDORSEMENT_POLICY_FAILURE
 *   - CHAINCODE_VERSION_CONFLICT
 *   - EXPIRED_CHAINCODE
 */
export const getRetryAction = (err: unknown): RetryAction => {
  if (isDuplicateTransactionError(err) || err instanceof ContractError) {
    return RetryAction.None;
  } else if (err instanceof TimeoutError) {
    return RetryAction.WithExistingTransactionId;
  }

  return RetryAction.WithNewTransactionId;
};

/**
 * Checks whether an error was caused by a duplicate transaction.
 *
 * This is ...painful.
 */
export const isDuplicateTransactionError = (err: unknown): boolean => {
  logger.debug({ err }, 'Checking for duplicate transaction error');

  if (err === undefined || err === null) return false;

  let isDuplicate;
  if (typeof (err as TransactionError).transactionCode === 'string') {
    // Checking whether a commit failure is caused by a duplicate transaction
    // is straightforward because the transaction code should be available
    isDuplicate = (err as TransactionError).transactionCode === 'DUPLICATE_TXID';
  } else {
    // Checking whether an endorsement failure is caused by a duplicate
    // transaction is only possible by processing error strings, which is not ideal.
    const endorsementError = err as {
      errors: {
        endorsements: {
          details: string;
        }[];
      }[];
    };

    isDuplicate = endorsementError?.errors?.some(err => err?.endorsements?.some(endorsement => endorsement?.details?.startsWith('duplicate transaction found')));
  }

  return isDuplicate === true;
};

/**
 * Base type for errors from the smart contract.
 *
 * These errors will not be retried.
 */
export class ContractError extends Error {
  transactionId: string;

  constructor(message: string, transactionId: string) {
    super(message);
    Object.setPrototypeOf(this, ContractError.prototype);

    this.name = 'TransactionError';
    this.transactionId = transactionId;
  }
}
