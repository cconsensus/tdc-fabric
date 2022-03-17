import { logger } from '../../../shared/utils/logger';
import { IdentityAuth } from '../assets/idAuth';
import { createOrUpdateCAId } from '../helper/serviceHelper';

/**
 * Service to update user inside Fabric Certificate Authority.
 * Aditional attributes to the identity may be passed by IdentityAuth.roles as an array.
 * @see FabricCaServices.IKeyValueAttribute:
 * {
 *   name:string,
 *   value:string,
 *   ecert:true
 * }
 */
class UpdateUserCAIdService {
  public async execute(idAuth: IdentityAuth): Promise<string> {
    logger.info(`--> INIT UpdateUserCAIdService: ${idAuth.login}`);
    const req = await createOrUpdateCAId(false, idAuth);
    logger.info(`--> END UpdateUserCAIdService : ${idAuth.login}`);
    return req;
  }
}

export default UpdateUserCAIdService;
