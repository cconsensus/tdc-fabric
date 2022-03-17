/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { IdentityAuth } from '../../modules/idauth/assets/idAuth';
import * as config from '../../config/config';

const prettyJSONString = (inputString: string): string => {
  if (inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
  } else {
    return inputString;
  }
};

const transFormIdentityAuthToArrayStringValues = (idAuth: IdentityAuth): string[] => {
  const values: string[] = [];
  if (idAuth.login) values.push(idAuth.login);
  if (idAuth.firstName) values.push(idAuth.firstName);
  if (idAuth.lastName) values.push(idAuth.lastName);
  if (idAuth.enrollmentId) values.push(idAuth.enrollmentId);
  if (idAuth.roles) values.push(JSON.stringify(idAuth.roles));
  if (idAuth.hlfRole) values.push(idAuth.hlfRole);
  if (idAuth.affiliation) {
    values.push(idAuth.affiliation);
  } else {
    values.push(config.dappDefaultAffiliation);
  }
  return values;
};

export { prettyJSONString, transFormIdentityAuthToArrayStringValues };
