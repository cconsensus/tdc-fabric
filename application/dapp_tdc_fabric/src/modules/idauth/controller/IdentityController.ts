import { Contract } from 'fabric-network';
import { Request, Response } from 'express';
import { IdentityAuth } from '../assets/idAuth';
import * as config from '../../../config/config';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import AuthenticateService from '../services/AuthenticateService';
import EvaluateTransactionService from '../services/EvaluateTransactionService';
import SubmitTransactionService from '../services/SubmitTransactionService';
import { transFormIdentityAuthToArrayStringValues } from '../../../shared/utils/AppUtil';
import { hash } from 'bcryptjs';
import { Queue } from 'bullmq';

const { ACCEPTED, OK } = StatusCodes;

export default class IdentityController {
  public async show(request: Request, response: Response): Promise<Response> {
    const loggedUser = request.user.id;
    const contract: Contract = request.app.locals[config.orgName + loggedUser]?.assetContract as Contract;
    const idAuth: IdentityAuth = request.params as unknown as IdentityAuth;
    const evaluateTransactionService = new EvaluateTransactionService('getIdByLogin', [idAuth.login]);
    const ret: IdentityAuth = await evaluateTransactionService.execute(contract);
    return response.status(OK).json(ret);
  }

  public async listByOrganization(request: Request, response: Response): Promise<Response> {
    const loggedUser = request.user.id;
    const contract: Contract = request.app.locals[config.orgName + loggedUser]?.assetContract as Contract;
    const { organization } = request.params;
    const evaluateTransactionService = new EvaluateTransactionService('findByOrg', [organization]);
    const ret = await evaluateTransactionService.execute(contract);
    return response.status(OK).json(ret);
  }

  public async listByOrganizationPaginated(request: Request, response: Response): Promise<Response> {
    const loggedUser = request.user.id;
    const contract: Contract = request.app.locals[config.orgName + loggedUser]?.assetContract as Contract;
    const { organization, pageSize, bookmark } = request.params;
    const evaluateTransactionService = new EvaluateTransactionService('findByOrgPaginated', [organization, pageSize, bookmark]);
    const ret = await evaluateTransactionService.execute(contract);
    return response.status(OK).json(ret);
  }

  public async listByAffiliation(request: Request, response: Response): Promise<Response> {
    const loggedUser = request.user.id;
    const contract: Contract = request.app.locals[config.orgName + loggedUser]?.assetContract as Contract;
    const { affiliation } = request.params;
    const evaluateTransactionService = new EvaluateTransactionService('findByAffiliation', [affiliation]);
    const ret = await evaluateTransactionService.execute(contract);
    return response.status(OK).json(ret);
  }

  public async listByAffiliationPaginated(request: Request, response: Response): Promise<Response> {
    const loggedUser = request.user.id;
    const contract: Contract = request.app.locals[config.orgName + loggedUser]?.assetContract as Contract;
    const { affiliation, pageSize, bookmark } = request.params;
    const evaluateTransactionService = new EvaluateTransactionService('findByAffiliationPaginated', [affiliation, pageSize, bookmark]);
    const ret = await evaluateTransactionService.execute(contract);
    return response.status(OK).json(ret);
  }

  public async showHistory(request: Request, response: Response): Promise<Response> {
    const loggedUser = request.user.id;
    const contract: Contract = request.app.locals[config.orgName + loggedUser]?.assetContract as Contract;
    const { login } = request.params;
    const evaluateTransactionService = new EvaluateTransactionService('getHistory', [login]);
    const ret = await evaluateTransactionService.execute(contract);
    return response.status(OK).json(ret);
  }

  public async validate(request: Request, response: Response): Promise<Response> {
    const loggedUser = request.user.id;
    const contract: Contract = request.app.locals[config.orgName + loggedUser]?.assetContract as Contract;
    const { login } = request.params;
    const evaluateTransactionService = new EvaluateTransactionService('idExists', [login]);
    const ret = await evaluateTransactionService.execute(contract);
    return response.status(OK).json(ret);
  }

  public async authenticate(request: Request, response: Response): Promise<Response> {
    const authenticateService = new AuthenticateService();
    const { login, password } = request.body;
    const ret = await authenticateService.execute({ req: request, login, password });
    return response.json(ret);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const idAuth: IdentityAuth = request.body as IdentityAuth;
    const transactionArgs = transFormIdentityAuthToArrayStringValues(idAuth);
    const contract = request.app.locals[config.orgName]?.assetContract as Contract;
    const pwd = {
      enrollmentSecretHash: Buffer.from(await hash(idAuth.enrollmentSecret, 8)),
    };
    const submitTransactionService = new SubmitTransactionService('createId', transactionArgs, pwd);
    const data = await submitTransactionService.execute(contract);
    return response.status(OK).json({
      status: getReasonPhrase(OK),
      data,
    });
  }

  public async createAsync(request: Request, response: Response): Promise<Response> {
    const loggedUser = request.user.id;
    const identityQueue = request.app.locals.jobq as Queue;
    const idAuth: IdentityAuth = request.body as IdentityAuth;
    const transactionArgs = transFormIdentityAuthToArrayStringValues(idAuth);
    const pwd = {
      enrollmentSecretHash: Buffer.from(await hash(idAuth.enrollmentSecret, 8)),
    };
    const submitTransactionService = new SubmitTransactionService('createId', transactionArgs, pwd);
    const data = await submitTransactionService.executeAsyncTransaction(identityQueue, loggedUser);
    return response.status(ACCEPTED).json({
      status: getReasonPhrase(ACCEPTED),
      job: data,
    });
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const idAuth: IdentityAuth = request.body as IdentityAuth;
    const transactionArgs = transFormIdentityAuthToArrayStringValues(idAuth);
    const contract = request.app.locals[config.orgName]?.assetContract as Contract;
    const pwd = {
      enrollmentSecretHash: Buffer.from(await hash(idAuth.enrollmentSecret, 8)),
    };
    const submitTransactionService = new SubmitTransactionService('updateId', transactionArgs, pwd);
    const data = await submitTransactionService.execute(contract);
    return response.status(OK).json({
      status: getReasonPhrase(OK),
      data,
    });
  }

  public async updateAsync(request: Request, response: Response): Promise<Response> {
    const loggedUser = request.user.id;
    const identityQueue = request.app.locals.jobq as Queue;
    const idAuth: IdentityAuth = request.body as IdentityAuth;
    const transactionArgs = transFormIdentityAuthToArrayStringValues(idAuth);
    const pwd = {
      enrollmentSecretHash: Buffer.from(await hash(idAuth.enrollmentSecret, 8)),
    };
    const submitTransactionService = new SubmitTransactionService('updateId', transactionArgs, pwd);
    const data = await submitTransactionService.executeAsyncTransaction(identityQueue, loggedUser);
    return response.status(ACCEPTED).json({
      status: getReasonPhrase(ACCEPTED),
      job: data,
    });
  }
}
