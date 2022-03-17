import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Iterators } from 'fabric-shim-api';
import { CcIdauth } from './cc-idauth';
import { compare } from 'bcryptjs';
import { validateAcess } from './cc-idauth-util';

@Info({
    title: 'cc-idauth',
    description: 'Chaincode to deal with identity and authentication using hyperledger fabric',
})
export class CcIdauthContract extends Contract {
    constructor() {
        super('br.com.cconsensus.regcon');
    }

    /**
     *  Override unknownTransaction
     * @param ctx
     * @returns {Promise<void>}
     */
    public async unknownTransaction(ctx: Context): Promise<void> {
        console.error(`==> unknownTransaction called by: ${ctx.clientIdentity.getMSPID()}`);
        console.error(`==> unknownTransaction Transaction ID: ${ctx.stub.getTxID()}`);
        console.error(`==> unknownTransaction Transaction ID: ${ctx.clientIdentity.getIDBytes().toString()}`);
        throw new Error(`An unknownTransaction was called here: ${ctx.clientIdentity.getMSPID()}`);
    }

    /**
     * Override beforeTransaction
     * @param ctx
     * @returns {Promise<void>}
     */
    public async beforeTransaction(ctx: Context): Promise<void> {
        console.info(`==> beforeTransaction called by: ${ctx.clientIdentity.getMSPID()}`);
        console.info(`==> beforeTransaction Transaction ID: ${ctx.stub.getTxID()}`);
        console.info(`==> beforeTransaction Transaction ID: ${ctx.clientIdentity.getIDBytes().toString()}`);
    }

    /**
     * Override afterTransaction
     * @param ctx
     * @returns {Promise<void>}
     */
    public async afterTransaction(ctx: Context): Promise<void> {
        console.info(`==> afterTransaction called by: ${ctx.clientIdentity.getMSPID()}`);
        console.info(`==> afterTransaction Transaction ID: ${ctx.stub.getTxID()}`);
        console.info(`==> afterTransaction Transaction ID: ${ctx.clientIdentity.getIDBytes().toString()}`);
    }

    /**
     * verifica se o asset existe na ledger.
     * @param ctx
     * @param login
     */
    @Transaction(false)
    @Returns('boolean')
    public async idExists(ctx: Context, login: string): Promise<boolean> {
        console.info('===== idExists INIT =====');
        const data: Uint8Array = await ctx.stub.getState(login);
        console.info('===== idExists END =====');
        return !!data && data.length > 0;
    }

    /**
     * Create the ID
     * @param ctx
     * @param login
     * @param firstName
     * @param lastName
     * @param enrollmentId
     * @param roles
     * @param hlfRole
     * @param affiliation
     */
    @Transaction(true)
    public async createId(
        ctx: Context,
        login: string,
        firstName: string,
        lastName: string,
        enrollmentId: string,
        roles: string,
        hlfRole: string,
        affiliation: string,
    ): Promise<void> {
        console.info('===== INIT createId =====');
        const idExists = await this.idExists(ctx, login);
        if (idExists) {
            throw new Error(`This ID ${login} already exists!`);
        }
        const organization = ctx.clientIdentity.getMSPID();
        console.info(`===== createId organization: ${organization} =====`);
        await this.updateOrCreate(ctx, login, firstName, lastName, enrollmentId, roles, hlfRole, organization, affiliation);
        console.info('===== END createId =====');
    }

    /**
     * Update or Create the ID. Helper private method.
     * @param ctx
     * @param login
     * @param firstName
     * @param lastName
     * @param enrollmentId
     * @param roles
     * @param hlfRole
     * @param organization
     * @param affiliation
     * @private
     */
    private async updateOrCreate(
        ctx: Context,
        login: string,
        firstName: string,
        lastName: string,
        enrollmentId: string,
        roles: string,
        hlfRole: string,
        organization: string,
        affiliation: string,
    ): Promise<void> {
        console.info('===== INIT updateOrCreate =====');
        validateAcess(ctx);
        const transientMap = await ctx.stub.getTransient();
        const enrollmentSecretHashBytes = transientMap.get('enrollmentSecretHash');
        if (!enrollmentSecretHashBytes || enrollmentSecretHashBytes.length === 0) {
            throw new Error('Enrollment Secret Hash was not provided as transient value!');
        }
        const ccIdauth: CcIdauth = new CcIdauth();
        ccIdauth.login = login;
        ccIdauth.firstName = firstName;
        ccIdauth.lastName = lastName;
        ccIdauth.enrollmentId = enrollmentId;
        ccIdauth.enrollmentSecret = enrollmentSecretHashBytes.toString();
        ccIdauth.roles = JSON.parse(roles);
        ccIdauth.hlfRole = hlfRole;
        ccIdauth.organization = organization;
        ccIdauth.affiliation = affiliation;
        const buffer: Buffer = Buffer.from(JSON.stringify(ccIdauth));
        await ctx.stub.putState(ccIdauth.login, buffer);
        console.info(`===== updateOrCreate identity: ${ccIdauth.login} =====`);
        console.info('===== INIT updateOrCreate =====');
    }

    /**
     * Update de ID in the ledger.
     * @param ctx
     * @param login
     * @param firstName
     * @param lastName
     * @param enrollmentId
     * @param roles
     * @param hlfRole
     */
    @Transaction(true)
    public async updateId(
        ctx: Context,
        login: string,
        firstName: string,
        lastName: string,
        enrollmentId: string,
        roles: string,
        hlfRole: string,
        affiliation: string,
    ): Promise<void> {
        console.info('===== INIT updateId =====');
        const idExists = await this.idExists(ctx, login);
        if (!idExists) {
            throw new Error(`This ID ${login} does not exists!`);
        }

        const ccIdauth: CcIdauth = (await this.getIdByLogin(ctx, login)) as CcIdauth;

        const organization = ctx.clientIdentity.getMSPID();
        console.info(`===== updateId organization: ${organization} =====`);
        if (ccIdauth.organization !== organization) {
            throw new Error(`This organization does not have rights to update this ID: ${organization}`);
        }
        await this.updateOrCreate(ctx, login, firstName, lastName, enrollmentId, roles, hlfRole, organization, affiliation);
        console.info('===== INIT updateId =====');
    }

    /**
     * Returns the ID
     * @param ctx
     * @param login
     */
    @Transaction(false)
    @Returns('CcIdAuth')
    public async getIdByLogin(ctx: Context, login: string): Promise<CcIdauth> {
        console.info(`===== getId INIT ${login} =====`);
        validateAcess(ctx);
        const exists: boolean = await this.idExists(ctx, login);
        if (!exists) {
            throw new Error(`This ID ${login} does not exists!`);
        }
        const data: Uint8Array = await ctx.stub.getState(login);
        const ccIdauth: CcIdauth = JSON.parse(data.toString()) as CcIdauth;
        ccIdauth.enrollmentSecret = undefined;
        console.info('===== getId END =====');
        return ccIdauth;
    }

    /**
     * Authenticate de user.
     * @param ctx
     * @param login
     */
    @Transaction(false)
    @Returns('boolean')
    public async authenticate(ctx: Context, login: string): Promise<boolean> {
        const transientMap = await ctx.stub.getTransient();
        const enrollmentSecretBytes = transientMap.get('enrollmentSecret');
        if (!enrollmentSecretBytes || enrollmentSecretBytes.length === 0) {
            throw new Error('Enrollment Secret not provided as transient value!');
        }
        if (!(await this.idExists(ctx, login))) {
            throw new Error(`Unable to find this identity: ${login}`);
        }
        console.info('===== authenticate INIT =====');
        const buffer: Buffer = (await ctx.stub.getState(login)) as Buffer;
        const idAuth: CcIdauth = JSON.parse(buffer.toString()) as CcIdauth;

        const pwdConfirmed = await compare(enrollmentSecretBytes.toString(), idAuth.enrollmentSecret);

        console.info('===== authenticate END =====');
        return pwdConfirmed;
    }

    /**
     * Get all users from a organization
     * @param ctx
     * @param organization
     */
    @Transaction(false)
    @Returns('string')
    public async findByOrg(ctx: Context, organization: string): Promise<string> {
        console.info('===== findByOrg INIT =====');
        validateAcess(ctx);
        const queryString = {
            selector: {
                organization,
            },
            use_index: ['_design/indexOrganizationDoc', 'indexOrganization'],
        };
        const results = await this.findByQuery(ctx, JSON.stringify(queryString));
        console.info(`findByOrg: \n  ${JSON.stringify(JSON.parse(results), null, 2)}`);
        console.info('===== findByOrg END =====');
        return results;
    }

    /**
     * Get all users from a organization
     * @param ctx
     * @param organization
     * @param pageSize
     * @param bookmark
     */
    @Transaction(false)
    @Returns('string')
    public async findByOrgPaginated(ctx: Context, organization: string, pageSize: number, bookmark: string): Promise<string> {
        console.info('===== findByOrgPaginated INIT =====');
        validateAcess(ctx);
        const queryString = {
            selector: {
                organization,
            },
            use_index: ['_design/indexOrganizationDoc', 'indexOrganization'],
        };
        const results = await this.findByQueryPaginated(ctx, JSON.stringify(queryString), pageSize, bookmark);
        console.info(`findByOrgPaginated: \n  ${JSON.stringify(JSON.parse(results), null, 2)}`);
        console.info('===== findByOrgPaginated END =====');
        return results;
    }

    /**
     * Get all users with provided affiliation (Ex.: department)
     * @param ctx
     * @param affiliation
     */
    @Transaction(false)
    @Returns('string')
    public async findByAffiliation(ctx: Context, affiliation: string): Promise<string> {
        console.info('===== findByOrg INIT =====');
        validateAcess(ctx);
        const queryString = {
            selector: {
                affiliation,
            },
            use_index: ['_design/indexAffiliationDoc', 'indexAffiliation'],
        };
        const results = await this.findByQuery(ctx, JSON.stringify(queryString));
        console.info(`findByOrg: \n  ${JSON.stringify(JSON.parse(results), null, 2)}`);
        console.info('===== findByOrg END =====');
        return results;
    }

    /**
     * Get all users with provided affiliation (Ex.: department)
     * @param ctx
     * @param affiliation
     * @param pageSize
     * @param bookmark
     */
    @Transaction(false)
    @Returns('string')
    public async findByAffiliationPaginated(ctx: Context, affiliation: string, pageSize: number, bookmark: string): Promise<string> {
        console.info('===== findByAffiliationPaginated INIT =====');
        validateAcess(ctx);
        const queryString = {
            selector: {
                affiliation,
            },
            use_index: ['_design/indexAffiliationDoc', 'indexAffiliation'],
        };
        const results = await this.findByQueryPaginated(ctx, JSON.stringify(queryString), pageSize, bookmark);
        console.info(`findByAffiliationPaginated: \n  ${JSON.stringify(JSON.parse(results), null, 2)}`);
        console.info('===== findByAffiliationPaginated END =====');
        return results;
    }

    /**
     * Consulta com query personalizada.
     * @param ctx
     * @param queryString
     */
    @Transaction(false)
    @Returns('string')
    public async findByQuery(ctx: Context, queryString: string): Promise<string> {
        console.info('===== findByQuery INIT =====');
        validateAcess(ctx);
        const results = await this.getAllResults(ctx.stub.getQueryResult(queryString));
        console.info(`findByQuery: \n  ${JSON.stringify(results, null, 2)}`);
        console.info('===== findByQuery END =====');
        return JSON.stringify(results);
    }

    /**
     * Consulta com query personalizada.
     * @param ctx
     * @param queryString
     * @param pageSize
     * @param bookmark
     */
    @Transaction(false)
    @Returns('string')
    public async findByQueryPaginated(ctx: Context, queryString: string, pageSize: number, bookmark: string): Promise<string> {
        console.info('===== findByQueryPaginated INIT =====');
        validateAcess(ctx);
        const { iterator, metadata } = await ctx.stub.getQueryResultWithPagination(queryString, pageSize, bookmark);
        const results = {
            results: await this.getAllResultsPaginated(iterator),
            RecordsCount: metadata.fetchedRecordsCount,
            Bookmark: metadata.bookmark,
        };
        console.info(`findByQueryPaginated: \n  ${JSON.stringify(results, null, 2)}`);
        console.info('===== findByQueryPaginated END =====');
        return JSON.stringify(results);
    }

    /**
     * Get History
     * @param ctx
     * @param login
     */
    @Transaction(false)
    @Returns('string')
    public async getHistory(ctx: Context, login: string): Promise<string> {
        console.info('===== getHistory INIT =====');
        validateAcess(ctx);
        const results = await this.getAllHitoryResults(ctx.stub.getHistoryForKey(login));
        console.info(`getHistory: \n ${JSON.stringify(results, null, 2)}`);
        const history = {
            AssetType: CcIdauth.assetType,
            id: login,
            history: results,
        };
        console.info('===== getHistory END =====');
        return JSON.stringify(history);
    }

    /**
     * Coloca todos os resultados da consulta em uma string
     * @param resultsIterator
     * @private
     */
    private async getAllResultsPaginated(resultsIterator: Iterators.StateQueryIterator): Promise<any[]> {
        console.info('===== getAllResultsPaginated INIT =====');
        const allResults = [];
        let res = await resultsIterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                try {
                    const jsonRes = {
                        Key: res.value.key,
                        Record: JSON.parse(res.value.value.toString()),
                    };
                    allResults.push(jsonRes);
                } catch (err) {
                    console.log(err);
                    const jsonRes = {
                        Key: res.value.key,
                        Record: res.value.value.toString(),
                    };
                    allResults.push(jsonRes);
                }
            }
            res = await resultsIterator.next();
        }
        console.info('===== getAllResultsPaginated END =====');
        return allResults;
    }

    /**
     * Get all results
     * @param resultsIterator
     * @private
     */
    private async getAllResults(resultsIterator: Promise<Iterators.StateQueryIterator> & AsyncIterable<Iterators.KV>): Promise<any[]> {
        console.info('===== getAllResults INIT =====');
        const allResults = [];
        for await (const { key, value } of resultsIterator) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                record.enrollmentSecret = undefined;
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ key, record });
        }
        console.info('===== getAllResults END =====');
        return allResults;
    }

    /**
     * Get all hstories.
     * @param resultsIterator
     * @private
     */
    private async getAllHitoryResults(resultsIterator: Promise<Iterators.HistoryQueryIterator> & AsyncIterable<Iterators.KeyModification>): Promise<any[]> {
        console.info('===== getAllHitoryResults INIT =====');
        const allResults = [];
        for await (const { isDelete, value, timestamp, txId } of resultsIterator) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                record.enrollmentSecret = undefined;
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ isDelete, record, timestamp, txId });
        }
        console.info('===== getAllHitoryResults END =====');
        return allResults;
    }
}
