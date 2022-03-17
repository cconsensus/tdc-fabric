import { logger } from '../../../shared/utils/logger';
import { IdentityAuth } from '../assets/idAuth';
import { createOrUpdateCAId } from '../helper/serviceHelper';

/**
 * Service to create user inside Fabric Certificate Authority.
 * Aditional attributes to the identity may be passed by IdentityAuth.roles as an array.
 * @see FabricCaServices.IKeyValueAttribute:
 * {
 *   name:string,
 *   value:string,
 *   ecert:true
 * }
 */
class CreateUserCAIdService {
  public async execute(idAuth: IdentityAuth): Promise<string> {
    logger.info(`--> INIT CreateUserCAIdService: ${idAuth.login}`);
    const req = await createOrUpdateCAId(true, idAuth);
    logger.info(`--> END CreateUserCAIdService: ${idAuth.login}`);
    return req;
  }
}

export default CreateUserCAIdService;
