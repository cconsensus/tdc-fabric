/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import FabricCAServices, { IServiceResponse, IKeyValueAttribute, IAttributeRequest } from 'fabric-ca-client';
import { Identity, Wallet } from 'fabric-network';
import * as config from '../../config/config';
import { handleError } from '../errors/error';
import { X509 } from 'jsrsasign';

/**
 * Builds de CA Client.
 * @param ccp connection profile
 * @param caHostName CA hostname
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const buildCAClient = (ccp: Record<string, any>, caHostName: string): FabricCAServices => {
  // Create a new CA client for interacting with the CA.
  const caInfo = ccp.certificateAuthorities[caHostName]; // lookup CA details from config

  const caClient = new FabricCAServices(caInfo.url, undefined, caInfo.caName);

  //const caClient2 = new FabricCAServices(
  //  caInfo.url,
  //  { trustedRoots: caTLSCACerts, verify: false },
  //   caInfo.caName,
  //);

  console.log(`Built a CA Client named ${caInfo.caName}`);
  return caClient;
};

/**
 * Enrolls admin identity
 * @param caClient Fabic CA Client
 * @param wallet Wallet
 * @param orgMspId ORG1 MSP
 * @returns Promise<void>
 */
const enrollAdmin = async (caClient: FabricCAServices, wallet: Wallet, orgMspId: string): Promise<void> => {
  try {
    // Check to see if we've already enrolled the admin user.
    const identity = await wallet.get(config.registarUser);
    if (identity) {
      console.log('An identity for the admin user already exists in the wallet');
      return;
    }

    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await caClient.enroll({
      enrollmentID: config.registarUser,
      enrollmentSecret: config.registarPass,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: orgMspId,
      type: 'X.509',
    };
    await wallet.put(config.registarUser, x509Identity);
    console.log('Successfully enrolled admin user and imported it into the wallet');
  } catch (error) {
    console.error(`Failed to enroll admin user : ${error}`);
  }
};

/**
 * Register and enroll user at the wallet.
 * @param caClient Fabric CA Client
 * @param wallet Wallet
 * @param orgMspId Org MSP
 * @param userId User ID
 * @param affiliation Affiliation
 * @returns Promise<void>
 */
const registerAndEnrollUser = async (caClient: FabricCAServices, wallet: Wallet, orgMspId: string, userId: string, affiliation: string): Promise<void> => {
  try {
    // Check to see if we've already enrolled the user
    const userIdentity = await wallet.get(userId);
    if (userIdentity) {
      console.log(`An identity for the user ${userId} already exists in the wallet`);
      return;
    }

    // Must use an admin to register a new user
    const adminIdentity = await wallet.get(config.registarUser);
    if (!adminIdentity) {
      console.log('An identity for the admin user does not exist in the wallet');
      console.log('Enroll the admin user before retrying');
      return;
    }

    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, config.registarUser);

    // Register the user, enroll the user, and import the new identity into the wallet.
    // if affiliation is specified by client, the affiliation value must be configured in CA
    const secret = await caClient.register(
      {
        affiliation,
        enrollmentID: userId,
        role: 'client',
      },
      adminUser,
    );
    const enrollment = await caClient.enroll({
      enrollmentID: userId,
      enrollmentSecret: secret,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: orgMspId,
      type: 'X.509',
    };
    await wallet.put(userId, x509Identity);
    console.log(`Successfully registered and enrolled user ${userId} and imported it into the wallet`);
  } catch (error) {
    console.error(`Failed to register user : ${error}`);
  }
};

/**
 * Register the user without enrrolling it @ wallet.
 * @param caClient Fabric CA Client
 * @param wallet Wallet
 * @param orgMspId
 * @param userId User ID
 * @param affiliation Affiliation
 * @param enrollmentSecret
 * @param attrs
 * @returns Promise<string | void>
 */
const registerUser = async (
  caClient: FabricCAServices,
  wallet: Wallet,
  orgMspId: string,
  userId: string,
  affiliation: string,
  enrollmentSecret?: string,
  attrs?: IKeyValueAttribute[],
): Promise<string | void> => {
  try {
    // Check to see if we've already enrolled the user
    const userIdentity = await wallet.get(userId);
    if (userIdentity) {
      console.log(`An identity for the user ${userId} already exists in the wallet`);
      return;
    }

    // Must use an admin to register a new user
    let adminIdentity = await wallet.get(config.registarUser);
    if (!adminIdentity) {
      console.log('An identity for the admin user does not exist in the wallet');
      console.log('Enrolling admin.');
      await enrollAdmin(caClient, wallet, orgMspId);
      adminIdentity = await wallet.get(config.registarUser);
      if (!adminIdentity) {
        throw new Error(`Unable to enroll admin: ${config.registarUser}`);
      }
    }

    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, config.registarUser);

    // Register the user, enroll the user, and import the new identity into the wallet.
    // if affiliation is specified by client, the affiliation value must be configured in CA
    const pwd = await caClient.register(
      {
        affiliation,
        enrollmentID: userId,
        role: 'client',
        maxEnrollments: 0,
        enrollmentSecret,
        attrs,
      },
      adminUser,
    );
    console.log(`Successfully registered user ${userId}`);
    return pwd;
  } catch (error) {
    console.error(`Failed to register user : ${error}`);
  }
};

/**
 * Enroll user @ system wallet.
 * @param caClient Fabric CA Client
 * @param wallet Wallet
 * @param orgMspId Org MSP
 * @param userId User ID
 * @param enrollmentSecret
 * @param attr_reqs
 * @returns Promise<void>
 */
const enrollUser = async (
  caClient: FabricCAServices,
  wallet: Wallet,
  orgMspId: string,
  userId: string,
  enrollmentSecret: string,
  attr_reqs?: IAttributeRequest[],
): Promise<any> => {
  try {
    // Check to see if we've already enrolled the user
    const userIdentity = await wallet.get(userId);
    if (userIdentity) {
      console.log(`An identity for the user ${userId} already exists in the wallet`);
      //return;
    }

    // Must use an admin to register a new user
    const adminIdentity = await wallet.get(config.registarUser);
    if (!adminIdentity) {
      console.log('An identity for the admin user does not exist in the wallet');
      console.log('Enroll the admin user before retrying');
      return;
    }
    const enrollment = await caClient.enroll({
      enrollmentID: userId,
      enrollmentSecret,
      attr_reqs,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: orgMspId,
      type: 'X.509',
    } as Identity;
    const certX509 = new X509();
    certX509.readCertPEM(enrollment.certificate);
    console.info(`Certificate: ${enrollment.certificate}`);
    console.info(`X509: ${certX509.getSerialNumberHex()}`);
    console.info(`X509: ${certX509.getInfo()}`);
    console.info(`X509: ${JSON.stringify(certX509.getExtInfo('1.2.3.4.5.6.7.8.1'))}`);

    await wallet.put(userId, x509Identity);
    console.log(`Successfully enrolled user ${userId} and imported it into the wallet`);
    return x509Identity;
  } catch (error) {
    console.error(`Failed to enroll user : ${error}`);
    throw handleError(error);
  }
};

/**
 * List all users that registrar can see.
 * @param caClient Fabric CA Client
 * @param wallet
 * @returns Promise<IServiceResponse | void>
 */
const listAllUsers = async (caClient: FabricCAServices, wallet: Wallet): Promise<IServiceResponse | void> => {
  const idService = caClient.newIdentityService();
  const registrar = await wallet.get(config.registarUser);
  if (!registrar) {
    console.log('An identity for the admin user does not exist in the wallet');
    console.log('Enroll the admin user before retrying');
    return;
  }

  // build a user object for authenticating with the CA
  const provider = wallet.getProviderRegistry().getProvider(registrar.type);
  const registrarUser = await provider.getUserContext(registrar, config.registarUser);
  const allIds = idService.getAll(registrarUser);
  return allIds;
};

export { buildCAClient, enrollAdmin, registerAndEnrollUser, registerUser, enrollUser, listAllUsers };
