/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

import { prettyJSONString } from '../shared/utils/AppUtil';
import { buildCAClient, registerUser, enrollUser, listAllUsers } from '../shared/utils/CAUtil';
import * as config from '../config/config';
import { loadConnectionProfile, buildWallet } from '../shared/utils/fabric';

const dappUser = config.dappUser;

async function main(): Promise<void> {
  try {
    // Create a new file system based wallet for managing identities.
    const caHostName = config.caHostName;
    const orgName = config.orgName;
    const walletPath = config.walletPath;
    const ccp = loadConnectionProfile();
    const caClient = buildCAClient(ccp, caHostName);
    const wallet = await buildWallet(walletPath);

    const dappSystemUser = await wallet.get(dappUser);

    if (dappSystemUser) {
      console.info(`DAPP system user: ${JSON.stringify(dappSystemUser)} already enrolled!`);
      process.exit(0);
    }

    const secret = await registerUser(caClient, wallet, orgName, dappUser, '');

    if (secret) {
      await enrollUser(caClient, wallet, orgName, dappUser, secret);
    } else {
      throw new Error(`Unable to enroll user: ${dappUser}`);
    }

    console.log(`User ${dappUser} registered and enrolled with success on ${caClient.getCaName()}!!`);

    const allIds = await listAllUsers(caClient, wallet);

    console.log(prettyJSONString(JSON.stringify(allIds)));
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
}

main().then(() => {
  console.info('DAPP system user enrolled with success.');
  process.exit(0);
});
