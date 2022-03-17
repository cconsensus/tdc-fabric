import { Request } from 'express';
import { logger } from '../../../shared/utils/logger';
import { handleError } from '../../../shared/errors/error';
import * as config from '../../../config/config';
import { Contract } from 'fabric-network';
import { evaluateTransaction } from '../../../shared/utils/fabric';

interface IRequest {
  req: Request;
  login: string;
}

class CheckUserIdValidService {
  public async execute({ req, login }: IRequest): Promise<boolean> {
    try {
      logger.info(`--> INIT CheckUserIdValidService: ${login}`);
      const contract = req.app.locals[config.orgName]?.assetContract as Contract;
      const buffer = await evaluateTransaction(contract, 'idExists', login);
      const data = JSON.parse(buffer.toString());
      const valid: boolean = data as boolean;
      logger.info(`--> END CheckUserIdValidService: ${login}`);
      return valid;
    } catch (err) {
      logger.error(`Error CheckUserIdValidService ID: ${JSON.stringify(err)}`);
      throw handleError(err);
    }
  }
}

export default CheckUserIdValidService;
