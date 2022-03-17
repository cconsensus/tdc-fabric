import { Gateway, Wallets } from 'fabric-network';

import * as fabproto6 from 'fabric-protos';
import * as path from 'path';
import * as fs from 'fs';
import { createQueryHandler } from '../config/queryhandler/QueryHandler';

import * as common from 'fabric-common';

const BlockDecoder = (common as any).BlockDecoder;

async function main() {
  try {
    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'Org1Wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);
    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    const connectionProfilePath = path.resolve(__dirname, '..', 'connection.json');
    const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));
    const connectionOptions = {
      wallet,
      identity: 'Org1 Admin',
      discovery: { enabled: true, asLocalhost: true },
      queryHandlerOptions: {
        timeout: 10, // timeout in seconds
        strategy: createQueryHandler,
      },
    };
    await gateway.connect(connectionProfile, connectionOptions);
    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');
    // Get the contract from the network.
    const contract = network.getContract('qscc');
    // Submit the specified transaction.
    // get chain info
    const result = await contract.evaluateTransaction('GetChainInfo', 'mychannel');
    // chaininfo buf decoded
    const blockProto = JSON.stringify(fabproto6.common.BlockchainInfo.decode(result));

    console.log(`# GetChainInfo: ${blockProto} \n`);

    //const resultGetBlockByNumber = await contract.evaluateTransaction('GetBlockByNumber', 'mychannel', '5');

    const resultGetByTxID = await contract.evaluateTransaction('GetBlockByTxID', 'mychannel', '1c910d812a594815592354d576a2f433cb22e0329d72c825d34ce14ca94fb957');

    //const resultDecoded = JSON.stringify(BlockDecoder.decode(resultGetBlockByNumber));

    const resultDecodedByBlockDecoder: fabproto6.common.Block = BlockDecoder.decode(resultGetByTxID);

    //if (resultDecodedByBlockDecoder instanceof Block) {
    console.log(`# data: ${JSON.stringify(resultDecodedByBlockDecoder.data?.data?.toString())} \n`);
    console.log(`# number: ${resultDecodedByBlockDecoder.header?.number} \n`);
    console.log(`# metadata: ${JSON.stringify(resultDecodedByBlockDecoder.metadata?.metadata?.toString())} \n`);
    // }
    const resultDecoded = JSON.stringify(fabproto6.common.Block.decode(resultGetByTxID));

    console.log(`# GetBlockByTxID: ${resultDecoded} \n`);

    // get transaction

    const transactionByTxID = await contract.evaluateTransaction('GetTransactionByID', 'mychannel', '1c910d812a594815592354d576a2f433cb22e0329d72c825d34ce14ca94fb957');

    const processedTransaction = BlockDecoder.decodeTransaction(transactionByTxID);

    // Iterate over actions
    const actions = processedTransaction.transactionEnvelope.payload.data.actions;
    for (const action of actions) {
      console.log(`Creator mspid: ${action.header.creator.mspid}`);
      const endorsers = processedTransaction.transactionEnvelope.payload.data.actions[0].payload.action.endorsements;
      for (let i = 0; i < endorsers.length; i++) {
        console.log(`Endorser ${i} mspid: ${endorsers[i].endorser.mspid}`);
      }
    }

    //console.log(`#==> Transaction: ${transactionByTxID}.`);

    // Disconnect from the gateway.
    gateway.disconnect();
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.stack);
    }
    console.error('RED ALERT, SHIELDS UP, PHASER CHARGED:', error);

    process.exit(1);
  }
}

main();
