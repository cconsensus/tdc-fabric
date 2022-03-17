import { Contract } from 'fabric-network';
import { logger } from '../../../shared/utils/logger';
import { evaluateTransaction } from '../../../shared/utils/fabric';
import { handleError } from '../../../shared/errors/error';
import { IEvaluateService } from '../../../shared/services/interfaces/iservice';
import IdAuthService from '../../../shared/services/idauthservice';
import IdentityError from '../../../shared/errors/IdentityError';

class EvaluateTransactionService extends IdAuthService implements IEvaluateService {
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
