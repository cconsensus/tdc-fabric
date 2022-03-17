import { Request, Response } from 'express';
import CreateSessionsService from '../services/CreateSessionsService';

export default class SessionsController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { login, password } = request.body;

    const createSession = new CreateSessionsService();

    const JSONheaders = JSON.stringify(request.headers);

    const userAuth: { user: string; token: string } = await createSession.execute({
      req: request,
      login,
      password,
      headers: JSONheaders,
    });

    return response.json(userAuth);
  }
}
