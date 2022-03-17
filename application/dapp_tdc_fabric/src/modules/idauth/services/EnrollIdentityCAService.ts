import { logger } from '../../../shared/utils/logger';
import { IdentityAuth } from '../assets/idAuth';
import * as config from '../../../config/config';
import { buildWallet, loadConnectionProfile } from '../../../shared/utils/fabric';
import { enrollUser, buildCAClient } from '../../../shared/utils/CAUtil';
import { IKeyValueAttribute, IAttributeRequest } from 'fabric-ca-client';

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
class EnrollIdentityCAService {
  public async execute(idAuth: IdentityAuth): Promise<string> {
    logger.info(`--> INIT EnrollIdentityCAService: ${idAuth.login}`);
    const caHostName = config.caHostName;
    const orgName = config.orgName;
    const wallet = await buildWallet(config.walletPath);
    const ccp = loadConnectionProfile();
    const caClient = buildCAClient(ccp, caHostName);

    const attrsReq: IKeyValueAttribute[] = idAuth.roles as IKeyValueAttribute[];
    const attrs_reqs: IAttributeRequest[] = [] as IAttributeRequest[];

    for (const attrReq of attrsReq) {
      if (attrReq.ecert) {
        attrs_reqs.push({
          name: attrReq.name,
          optional: !attrReq.ecert,
        } as IAttributeRequest);
      } else {
        attrs_reqs.push({
          name: attrReq.name,
          optional: attrReq.ecert,
        } as IAttributeRequest);
      }
    }

    const enrollment = await enrollUser(caClient, wallet, orgName, idAuth.login, idAuth.enrollmentSecret, attrs_reqs);
    logger.info(`--> END EnrollIdentityCAService: ${idAuth.login}`);
    return JSON.parse(JSON.stringify(enrollment));
  }
}

export default EnrollIdentityCAService;
