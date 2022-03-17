import { Request, Response } from 'express';
import GetTransactionValidationCodeService from '../services/GetTransactionValidationCodeService';
import GetTransactionService from '../services/GetTransactionService';
import GetBlockChainInfoService from '../services/GetBlockchainInfoService';
import GetBlockByTransactionService from '../services/GetBlockByTransactionService';
import GetBlockByNumberService from '../services/GetBlockByNumberService';
import GetBlockByHashService from '../services/GetBlockByHashService';
import { Contract } from 'fabric-network';
import * as config from '../../../config/config';

export default class QsccController {
  public async showTxValidationCode(request: Request, response: Response): Promise<Response> {
    const getTransactionValidationCodeService = new GetTransactionValidationCodeService();
    const loggedUser = request.user.id;
    const qsccContract: Contract = request.app.locals[config.orgName + loggedUser]?.qsccContract as Contract;
    const { txId } = request.params;
    const data = await getTransactionValidationCodeService.execute({ qsccContract, txId });
    return response.json(data);
  }

  public async showTransaction(request: Request, response: Response): Promise<Response> {
    const getTransactionService = new GetTransactionService();
    const loggedUser = request.user.id;
    const qsccContract: Contract = request.app.locals[config.orgName + loggedUser]?.qsccContract as Contract;
    const { txId } = request.params;
    const data = await getTransactionService.execute({ qsccContract, txId });
    return response.json(data);
  }

  public async showBlockByTxId(request: Request, response: Response): Promise<Response> {
    const getBlockByTransactionService = new GetBlockByTransactionService();
    const loggedUser = request.user.id;
    const qsccContract: Contract = request.app.locals[config.orgName + loggedUser]?.qsccContract as Contract;
    const { txId } = request.params;
    const data = await getBlockByTransactionService.execute({ qsccContract, txId });
    return response.json(data);
  }

  public async showBlockByNumber(request: Request, response: Response): Promise<Response> {
    const getBlockByNumberService = new GetBlockByNumberService();
    const loggedUser = request.user.id;
    const qsccContract: Contract = request.app.locals[config.orgName + loggedUser]?.qsccContract as Contract;
    const { blockNumber } = request.params;
    const data = await getBlockByNumberService.execute({ qsccContract, blockNumber });
    return response.json(data);
  }

  public async showBlockByHash(request: Request, response: Response): Promise<Response> {
    const getBlockByHashService = new GetBlockByHashService();
    const loggedUser = request.user.id;
    const qsccContract: Contract = request.app.locals[config.orgName + loggedUser]?.qsccContract as Contract;
    const { hash } = request.params;
    const data = await getBlockByHashService.execute({ qsccContract, hash });
    return response.json(data);
  }

  public async showChainInfo(request: Request, response: Response): Promise<Response> {
    const getBlockChainInfoService = new GetBlockChainInfoService();
    const loggedUser = request.user.id;
    const qsccContract: Contract = request.app.locals[config.orgName + loggedUser]?.qsccContract as Contract;
    const data = await getBlockChainInfoService.execute({ qsccContract });
    return response.json(data);
  }
}
