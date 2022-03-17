import { Request } from 'express';
import { logger } from '../../../shared/utils/logger';
import { IdentityAuth } from '../assets/idAuth';
import { handleError } from '../../../shared/errors/error';
import * as config from '../../../config/config';
import { Contract } from 'fabric-network';
import { evaluateTransaction } from '../../../shared/utils/fabric';

interface IRequest {
  req: Request;
  idAuth: IdentityAuth;
}

class GetIdByLoginService {
  public async execute({ req, idAuth }: IRequest): Promise<IdentityAuth> {
    try {
      logger.info(`--> INIT GetLoginByIdService: ${idAuth.login}`);
      const contract = req.app.locals[config.orgName]?.assetContract as Contract;
      const buffer: Buffer = (await evaluateTransaction(contract, 'getIdByLogin', idAuth.login)) as Buffer;
      const id: IdentityAuth = JSON.parse(buffer.toString()) as IdentityAuth;
      logger.info(`--> END CheckUserIdValidService: ${idAuth.login}`);
      return id;
    } catch (err) {
      logger.error(`Error CheckUserIdValidService ID: ${JSON.stringify(err)}`);
      throw handleError(err);
    }
  }
}

export default GetIdByLoginService;
