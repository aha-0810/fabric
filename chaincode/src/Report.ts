/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Report {
    @Property()
    public docType: string;

    @Property()
    public reportID: string;

    @Property()
    public reporterID: string;

    @Property()
    public sectionIDOfDefection: string;
    
    @Property()
    public descriptionOfDefection: string;

    @Property()
    public imageHashOfDefection: string;

    @Property()
    public reportToFMerID: string;

    @Property()
    public reportToFMerName: string;
}
