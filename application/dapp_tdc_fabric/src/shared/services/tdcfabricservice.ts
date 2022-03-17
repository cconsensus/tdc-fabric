import IdentityError from '../errors/IdentityError';
import { TransientMap } from 'fabric-network';

export default class TdcFabricService {
  readonly transactionArgs: string[];
  readonly transientData: TransientMap;

  constructor(transactionArgs: string[], transientData?: TransientMap) {
    if (!transactionArgs) {
      throw new IdentityError('Nenhum parâmetro foi passado durante inicialização do serviço.');
    }

    if (transactionArgs) {
      this.transactionArgs = transactionArgs;
    }

    if (transientData) {
      this.transientData = transientData;
    }
  }

  public returnServiceParametersAsArrayValues(): string[] {
    return this.transactionArgs;
  }
}
