/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Work {
    @Property()
    public docType: string;

    @Property()
    public workID: string;

    @Property()
    public workType: string;

    @Property()
    public sectionIDOfDefection: string;

    @Property()
    public descriptionOfDefection: string;

    @Property()
    public imageHashOfDefection: string;

    @Property()
    public workStatus: string;

    @Property()
    public assignToContractorID: string;

    @Property()
    public assignToContractorName: string;

    @Property()
    public reportID: string;
}
