import { Gateway, Wallets } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  try {
    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'Org1Wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);
    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    const connectionProfilePath = path.resolve(__dirname, '..', 'src', 'connection', 'connection-org1-org2-org3.json');
    const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));
    const connectionOptions = {
      wallet,
      identity: 'davidUser',
      discovery: {
        enabled: true,
        asLocalhost: false,
      },
    };
    await gateway.connect(connectionProfile, connectionOptions);
    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');
    // Get the contract from the network.
    //const contract = network.getContract('br.com.cconsensus.regcon', 'cc-regcon');
    const contract = network.getContract('regcon', 'br.com.cconsensus.regcon');
    // Submit the specified transaction.

    const contrato = {
      regConID: '0000006ALINEDRregConID',
      numeroContrato: '000016numeroContrato',
      numeroContratoExterno: '000016numeroContratoExterno',
      dataContrato: '2022-06-21T00:00:00.000+0000',
      cnpjAgenteFinanceiro: '45441789000154',
      nomeAgenteFinanceiro: 'ADM DE CONS HONDA LTDA',
      cpfCnpjProprietario: '69827931172',
      nomeProprietario: 'DAVID REIS',
      chassi: 'TTSD2KD0810MR056447',
      numRestricaoChassi: '1222501',
      ufRegistro: 'RJ',
      tipoRestricacao: '3',
      conteudoContrato: 'FUTURAMENTE CAMPO SERÁ USADO PARA GRAVAR TODOS OS DADOS DO CONTRATO',
    };
    await contract.submitTransaction(
      'registrar',
      contrato.regConID,
      contrato.numeroContrato,
      contrato.numeroContratoExterno,
      contrato.dataContrato,
      contrato.cnpjAgenteFinanceiro,
      contrato.nomeAgenteFinanceiro,
      contrato.cpfCnpjProprietario,
      contrato.nomeProprietario,
      contrato.chassi,
      contrato.numRestricaoChassi,
      contrato.ufRegistro,
      contrato.tipoRestricacao,
      contrato.conteudoContrato,
    );
    console.log('Registro enviado para o peer!!!');
    // Disconnect from the gateway.
    gateway.disconnect();
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stach:', error.stack);
      console.error('Erro name:', error.name);
    } else {
      console.error('Unknown error:', error);
    }

    process.exit(1);
  }
}

main();
