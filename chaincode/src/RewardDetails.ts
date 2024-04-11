/*
  SPDX-License-Identifier: Apache-2.0
*/

import { Object, Property } from 'fabric-contract-api';

@Object()
export class UserPrivateData {

  @Property()
  public rewardID: string;

  @Property()
  public reporterID: string;

  @Property()
  public reporterName: string;

  @Property()
  public reporterMobile: string;

  @Property()
  public reporterBankAccount: string;
}

@Object()
export class ContractorPrivateData {
  @Property()
  public rewardID: string;

  @Property()
  public contractorID: string;

  @Property()
  public contractorName: string;

  @Property()
  public contractorStaffName: string;

  @Property()
  public contractorStaffMobile: string;

  @Property()
  public contractorBankAccount: string;
}