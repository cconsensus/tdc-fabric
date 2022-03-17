import { Request, Response } from 'express';
import CreateUserIdCAService from '../services/CreateUserIdCAService';
import UpdateUserIdCAService from '../services/UpdateUserIdCAService';
import ListUsersIdCAService from '../services/ListUsersIdCAService';
import GetIdCAService from '../services/GetIdCAService';
import EnrollIdentityCAService from '../services/EnrollIdentityCAService';
import { IdentityAuth } from '../assets/idAuth';

export default class IdentityController {
  public async create(request: Request, response: Response): Promise<Response> {
    const createUserIdCAService = new CreateUserIdCAService();
    const idAuth: IdentityAuth = request.body as IdentityAuth;
    const ret = await createUserIdCAService.execute(idAuth);
    return response.json(ret);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const updateUserIdCAService = new UpdateUserIdCAService();
    const idAuth: IdentityAuth = request.body as IdentityAuth;
    const ret = await updateUserIdCAService.execute(idAuth);
    return response.json(ret);
  }

  public async listAllCAIdentities(request: Request, response: Response): Promise<Response> {
    const listUsersIdCAService = new ListUsersIdCAService();
    const ret = await listUsersIdCAService.execute();
    return response.json(ret);
  }

  public async getCAIdentity(request: Request, response: Response): Promise<Response> {
    const getIdCAService = new GetIdCAService();
    const { enrollmentId } = request.params;
    const ret = await getIdCAService.execute(enrollmentId);
    return response.json(ret);
  }

  public async enrollIdentity(request: Request, response: Response): Promise<Response> {
    const enrollIdentityCAService = new EnrollIdentityCAService();
    const idAuth: IdentityAuth = request.body as IdentityAuth;
    const ret = await enrollIdentityCAService.execute(idAuth);
    return response.json(ret);
  }
}
