import { sign } from 'jsonwebtoken';
import authConfig from '../../../config/auth';
import IdentityError from '../../../shared/errors/IdentityError';
import AuthenticateService from './AuthenticateService';
import { Request } from 'express';

interface IRequest {
  req: Request;
  login: string;
  password: string;
  headers: string;
}

interface IResponse {
  user: string;
  token: string;
}

class ResponseImpl implements IResponse {
  readonly user: string;
  token: string;

  constructor(user: string, token: string) {
    this.user = user;
    this.token = token;
  }
}

class CreateSessionsService {
  public async execute({ req, login, password, headers }: IRequest): Promise<IResponse> {
    const authenticateService = new AuthenticateService();

    const authenticated: boolean = await authenticateService.execute({ req, login, password });

    if (!authenticated) {
      throw new IdentityError('Unable to authenticate and generate JWT session!');
    }

    const userAuth = new ResponseImpl(login, 'tokentoken');

    const token = sign({ headers }, authConfig.jwt.secret, {
      subject: userAuth.user,
      expiresIn: authConfig.jwt.expiresIn,
    });
    userAuth.token = token;
    return userAuth;
  }
}

export default CreateSessionsService;
