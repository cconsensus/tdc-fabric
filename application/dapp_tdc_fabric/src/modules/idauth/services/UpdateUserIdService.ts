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
 * Service to update user inside the ledger / blockchain network
 * Aditional attributes to the identity may be passed by IdentityAuth.roles as an array.
 * @see FabricCaServices.IKeyValueAttribute:
 * {
 *   name:string,
 *   value:string,
 *   ecert:true
 * }
 */
class UpdateUserIdService {
  public async execute({ req, idAuth }: IRequest): Promise<{ txId: string }> {
    logger.info(`--> INIT UpdateUserIdService: ${idAuth.login}`);
    const contract = req.app.locals[config.orgName]?.assetContract as Contract;
    const data = await createOrUpdateId('updateId', { contract, idAuth });
    logger.info(`--> END UpdateUserIdService: ${idAuth.login}`);
    return data;
  }
}

export default UpdateUserIdService;
