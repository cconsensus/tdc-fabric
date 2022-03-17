import { logger } from '../../../shared/utils/logger';
import * as config from '../../../config/config';
import { buildWallet, loadConnectionProfile } from '../../../shared/utils/fabric';
import { buildCAClient } from '../../../shared/utils/CAUtil';

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
class GetIdCAService {
  public async execute(enrollmentId: string): Promise<string> {
    logger.info('--> INIT GetIdCAService <--');
    const caHostName = config.caHostName;
    const wallet = await buildWallet(config.walletPath);
    const ccp = loadConnectionProfile();
    const caClient = buildCAClient(ccp, caHostName);
    const identityServices = caClient.newIdentityService();
    const registarUser = await wallet.get(config.registarUser);

    if (!registarUser) {
      throw new Error(`Unable to find ${config.registarUser} enrolled on wallet!`);
    }
    const provider = wallet.getProviderRegistry().getProvider(registarUser.type);
    const registrar = await provider.getUserContext(registarUser, config.registarUser);
    const id = await identityServices.getOne(enrollmentId, registrar);

    logger.info('--> END GetIdCAService <--');
    return JSON.parse(JSON.stringify(id));
  }
}

export default GetIdCAService;
