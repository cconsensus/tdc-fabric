import { Contract } from 'fabric-network';
import { Request } from 'express';
import { logger } from '../../../shared/utils/logger';
import { handleError } from '../../../shared/errors/error';
import * as config from '../../../config/config';
import { evaluateTransaction } from '../../../shared/utils/fabric';

interface IRequest {
  req: Request;
  affiliation: string;
}

class FindByAffiliationService {
  public async execute({ req, affiliation }: IRequest): Promise<any> {
    try {
      logger.info(`--> INIT FindByAffiliationService: ${affiliation}`);
      const contract = req.app.locals[config.orgName]?.assetContract as Contract;
      const buffer: Buffer = (await evaluateTransaction(contract, 'findByAffiliation', affiliation)) as Buffer;
      const results = JSON.parse(buffer.toString());
      logger.info(`--> END FindByOrganizationService: ${affiliation}`);
      return results;
    } catch (err) {
      logger.error(`Error FindByAffiliationService ID: ${JSON.stringify(err)}`);
      throw handleError(err);
    }
  }
}

export default FindByAffiliationService;
