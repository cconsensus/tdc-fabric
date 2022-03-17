import { Contract } from 'fabric-network';
import { Request } from 'express';
import { logger } from '../../../shared/utils/logger';
import { handleError } from '../../../shared/errors/error';
import * as config from '../../../config/config';
import { evaluateTransaction } from '../../../shared/utils/fabric';

interface IRequest {
  req: Request;
  organization: string;
}

class FindByOrganizationService {
  public async execute({ req, organization }: IRequest): Promise<any> {
    try {
      logger.info(`--> INIT FindByOrganizationService: ${organization}`);
      const contract = req.app.locals[config.orgName]?.assetContract as Contract;
      const buffer: Buffer = (await evaluateTransaction(contract, 'findByOrg', organization)) as Buffer;
      const results = JSON.parse(buffer.toString());
      logger.info(`--> END FindByOrganizationService: ${organization}`);
      return results;
    } catch (err) {
      logger.error(`Error FindByOrganizationService ID: ${JSON.stringify(err)}`);
      throw handleError(err);
    }
  }
}

export default FindByOrganizationService;
