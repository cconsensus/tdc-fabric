import { Contract } from 'fabric-network';
import { logger } from '../utils/logger';
import { evaluateTransaction } from '../utils/fabric';
import { handleError } from '../errors/error';
import { IEvaluateService } from './interfaces/iservice';
import TdcFabricService from './tdcfabricservice';
import IdentityError from '../errors/IdentityError';

class EvaluateTransactionService extends TdcFabricService implements IEvaluateService {
  readonly transactionName: string;

  constructor(transactionName: string, transactionArgs: string[]) {
    super(transactionArgs);
    if (!transactionName) {
      throw new IdentityError('Operation must be supplied');
    }
    this.transactionName = transactionName;
  }

  public async execute(contract: Contract): Promise<any> {
    try {
      logger.info(`--> INIT EvaluateTransactionService - transaction: ${this.transactionName} <---`);
      const serviceParams: string[] = super.returnServiceParametersAsArrayValues();
      const buffer = await evaluateTransaction(contract, this.transactionName, ...serviceParams);
      const data = JSON.parse(buffer.toString());
      logger.info('---> END EvaluateTransactionService < ---');
      return data;
    } catch (err) {
      throw handleError(err);
    }
  }
}

export default EvaluateTransactionService;
