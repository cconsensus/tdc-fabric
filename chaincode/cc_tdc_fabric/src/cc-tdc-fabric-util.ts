import { Context } from 'fabric-contract-api';

/**
 * Validate de access. If the identity has the following attribute:
 * - name: identityAuthService
 * - value: 'true'
 * @param ctx
 * @throw Error if the user has no rights.
 */
export const validateAcess = (ctx: Context): void => {
    const hasRights = ctx.clientIdentity.assertAttributeValue('identityAuthService', 'true');
    if (!hasRights) {
        throw new Error(`This user: ${ctx.clientIdentity.getID()} has no rights to access this operation!!`);
    }
};
