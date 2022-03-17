import { Request } from 'express';
import { logger } from '../../../shared/utils/logger';
import { IdentityAuth } from '../assets/idAuth';
import { createOrUpdateId } from '../helper/serviceHelper';
import * as config from '../../../config/config';
import { Contract } from 'fabric-network';

interface IRequest {
  req: Request;
  idAuth: IdentityAuth;
}

/**
 * Service to create user inside the ledger / blockchain network
 * Aditional attributes to the identity may be passed by IdentityAuth.roles as an array.
 * @see FabricCaServices.IKeyValueAttribute:
 * {
 *   name:string,
 *   value:string,
 *   ecert:true
 * }
 */
class CreateUserIdService {
  /**
   * Execute
   * @param req
   * @param idAuth
   */
  public async execute({ req, idAuth }: IRequest): Promise<{ txId: string }> {
    logger.info(`--> INIT CreateUserIdService: ${idAuth.login}`);
    const contract = req.app.locals[config.orgName]?.assetContract as Contract;
    const data = await createOrUpdateId('createId', { contract, idAuth });
    logger.info(`--> END CreateUserIdService: ${idAuth.login}`);
    return data;
  }
}

export default CreateUserIdService;
