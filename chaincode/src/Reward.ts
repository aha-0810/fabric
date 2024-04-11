/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Reward {
    @Property()
    public docType: string;

    @Property()
    public rewardID: string;

    @Property()
    public sectionID: string;

    @Property()
    public workID: string;

    @Property()
    public workStatus: string;
}
