import { Request } from 'express';
import { logger } from '../../../shared/utils/logger';
import { handleTXError } from '../../../shared/errors/error';
import * as config from '../../../config/config';
import { Contract } from 'fabric-network';

interface IRequest {
  req: Request;
  login: string;
  password: string;
}

class AuthenticateService {
  public async execute({ req, login, password }: IRequest): Promise<boolean> {
    let txId = '';
    try {
      logger.info(`--> INIT AuthenticateService: ${login}`);
      const contract = req.app.locals[config.orgName]?.assetContract as Contract;
      const transaction = contract.createTransaction('authenticate');

      const pwd = {
        enrollmentSecret: Buffer.from(password),
      };

      transaction.setTransient(pwd);
      txId = transaction.getTransactionId();
      const buffer: Buffer = (await transaction.evaluate(login)) as Buffer;

      logger.info(`--> AuthenticateService Transaction ID: ${txId}`);
      if (buffer && buffer.length > 0) {
        const valid: boolean = JSON.parse(buffer.toString()) as boolean;
        return valid;
      }
      logger.info(`--> END AuthenticateService: ${login}`);
      return false;
    } catch (err) {
      logger.error(`Error AuthenticateService: ${JSON.stringify(err)}`);
      throw handleTXError(txId, err);
    }
  }
}

export default AuthenticateService;
