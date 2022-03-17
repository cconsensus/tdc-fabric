/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class CcIdauth {
    @Property()
    public static assetType = 'CcIdauth';

    @Property()
    public login: string;

    @Property()
    public firstName: string;

    @Property()
    public lastName: string;

    @Property()
    public enrollmentId: string;

    @Property()
    public enrollmentSecret: string;

    @Property()
    public roles: string;

    @Property()
    public hlfRole: string;

    @Property()
    public organization: string;

    @Property()
    public affiliation: string;
}

@Object()
export class CcTokenAccount {
    @Property()
    public static assetType = 'CcTokenAccount';

    @Property()
    public owner: string;

    @Property()
    public balance: number;
}
