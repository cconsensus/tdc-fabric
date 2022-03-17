import { Contract } from 'fabric-network';
import { Request, Response } from 'express';
import { TokenAccount } from '../assets/tokenAccount';
import * as config from '../../../config/config';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

import EvaluateTransactionService from '../../../shared/services/EvaluateTransactionService';
import SubmitTransactionService from '../../../shared/services/SubmitTransactionService';
import { transformTokenAccountToArrayStringValues } from '../../../shared/utils/AppUtil';
import { Queue } from 'bullmq';

const { ACCEPTED, OK } = StatusCodes;

export default class TokenController {
  public async show(request: Request, response: Response): Promise<Response> {
    const loggedUser = request.user.id;
    const contract: Contract = request.app.locals[config.orgName + loggedUser]?.assetContract as Contract;
    const tokenAccount: TokenAccount = request.params as unknown as TokenAccount;
    const evaluateTransactionService = new EvaluateTransactionService('getTokenAccountByOwner', [tokenAccount.owner]);
    const ret: TokenAccount = await evaluateTransactionService.execute(contract);
    return response.status(OK).json(ret);
  }

  public async showHistory(request: Request, response: Response): Promise<Response> {
    const loggedUser = request.user.id;
    const contract: Contract = request.app.locals[config.orgName + loggedUser]?.assetContract as Contract;
    const { owner } = request.params;
    const evaluateTransactionService = new EvaluateTransactionService('getTokenAccountHistory', [owner]);
    const ret = await evaluateTransactionService.execute(contract);
    return response.status(OK).json(ret);
  }

  public async init(request: Request, response: Response): Promise<Response> {
    const tokenAccount: TokenAccount = request.body as TokenAccount;
    const transactionArgs = transformTokenAccountToArrayStringValues(tokenAccount);
    const contract = request.app.locals[config.orgName]?.assetContract as Contract;
    const submitTransactionService = new SubmitTransactionService('initTokenAccount', transactionArgs);
    const data = await submitTransactionService.execute(contract);
    return response.status(OK).json({
      status: getReasonPhrase(OK),
      data,
    });
  }

  public async addTokens(request: Request, response: Response): Promise<Response> {
    const loggedUser = request.user.id;
    const identityQueue = request.app.locals.jobq as Queue;
    const { owner, value } = request.body;
    const submitTransactionService = new SubmitTransactionService('addTokens', [owner, value]);
    const data = await submitTransactionService.executeAsyncTransaction(identityQueue, loggedUser);
    return response.status(ACCEPTED).json({
      status: getReasonPhrase(ACCEPTED),
      job: data,
    });
  }

  public async subtractTokens(request: Request, response: Response): Promise<Response> {
    const loggedUser = request.user.id;
    const identityQueue = request.app.locals.jobq as Queue;
    const { owner, value } = request.body;
    const submitTransactionService = new SubmitTransactionService('subtractTokens', [owner, value]);
    const data = await submitTransactionService.executeAsyncTransaction(identityQueue, loggedUser);
    return response.status(ACCEPTED).json({
      status: getReasonPhrase(ACCEPTED),
      job: data,
    });
  }
}
