import { Contract } from 'fabric-network';
import { Request } from 'express';
import { logger } from '../../../shared/utils/logger';
import { handleError } from '../../../shared/errors/error';
import * as config from '../../../config/config';
import { evaluateTransaction } from '../../../shared/utils/fabric';

interface IRequest {
  req: Request;
  login: string;
}

class GetIdHistoryService {
  public async execute({ req, login }: IRequest): Promise<any> {
    try {
      logger.info(`--> INIT GetIdHistoryService: ${login}`);
      const contract = req.app.locals[config.orgName]?.assetContract as Contract;
      const buffer: Buffer = (await evaluateTransaction(contract, 'getHistory', login)) as Buffer;
      const history = JSON.parse(buffer.toString());
      logger.info(`--> END GetIdHistoryService: ${login}`);
      return history;
    } catch (err) {
      logger.error(`Error GetIdHistoryService ID: ${JSON.stringify(err)}`);
      throw handleError(err);
    }
  }
}

export default GetIdHistoryService;
