import { Contract, TransientMap } from 'fabric-network';
import { Queue } from 'bullmq';
import { logger } from '../../../shared/utils/logger';
import { submitTransaction } from '../../../shared/utils/fabric';
import { handleError } from '../../../shared/errors/error';
import { addSubmitTransactionJob } from '../../../shared/utils/jobs';
import { ISubmitService } from '../../../shared/services/interfaces/iservice';
import IdAuthService from '../../../shared/services/idauthservice';
import IdentityError from '../../../shared/errors/IdentityError';

class SubmitTransactionService extends IdAuthService implements ISubmitService {
  readonly transactionName: string;

  constructor(transactionName: string, transactionArgs: string[], transientData?: TransientMap) {
    super(transactionArgs, transientData);
    if (!transactionName) {
      throw new IdentityError('Operation must be supplied');
    }
    this.transactionName = transactionName;
  }

  public async executeAsyncTransaction(queue: Queue, jobUser: string): Promise<{ jobId: string; timestamp: string }> {
    try {
      logger.info(`--> INIT SubmitTransactionService - transaction: ${this.transactionName} <---`);
      const serviceParams: string[] = super.returnServiceParametersAsArrayValues();
      const jobId = await addSubmitTransactionJob(queue, jobUser, this.transactionName, this.transientData ? this.transientData : undefined, ...serviceParams);
      logger.info('---> END SubmitTransactionService < ---');
      return { jobId, timestamp: new Date().toISOString() };
    } catch (err) {
      throw handleError(err);
    }
  }

  public async execute(contract: Contract): Promise<{ txId: string }> {
    logger.info(`--> INIT SubmitTransactionService - transaction: ${this.transactionName} <---`);
    const transaction = contract.createTransaction(this.transactionName);
    const serviceParams: string[] = super.returnServiceParametersAsArrayValues();
    if (this.transientData) {
      transaction.setTransient(this.transientData);
    }
    await submitTransaction(transaction, ...serviceParams);
    const data = {
      txId: transaction.getTransactionId(),
    };
    logger.info('---> END SubmitTransactionService < ---');
    return data;
  }
}

export default SubmitTransactionService;
