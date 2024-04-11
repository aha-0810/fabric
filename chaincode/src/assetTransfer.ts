/*
 * SPDX-License-Identifier: Apache-2.0
 */
import { Context, Contract, Info, Returns,Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Report} from './Report';
import {Work} from './Work';
import {Reward} from './Reward';
import { UserPrivateData, ContractorPrivateData } from './RewardDetails';
import * as crypto from 'crypto';

@Info({ title: 'SmartContract', description: 'Smart contract for managing Defection with BIM and MySQL' })
export class SmartContract extends Contract {

    @Transaction()
    public async createReportData(ctx: Context, reportDataJson: string): Promise<void> {

        const reportDataObject = JSON.parse(reportDataJson);

        const reportData = new Report();
        reportData.docType = 'ReportData';
        reportData.reportID = reportDataObject.reportID;
        reportData.reporterID = reportDataObject.reporterID;
        reportData.sectionIDOfDefection = reportDataObject.sectionIDOfDefection;
        reportData.descriptionOfDefection = reportDataObject.descriptionOfDefection;
        reportData.imageHashOfDefection = reportDataObject.imageHashOfDefection;
        reportData.reportToFMerID = reportDataObject.reportToFMerID;
        reportData.reportToFMerName = reportDataObject.reportToFMerName;

        const reportDataAsBytes = Buffer.from(JSON.stringify(reportData));
        await ctx.stub.putState(reportData.reportID, reportDataAsBytes);

        const eventPayload = Buffer.from(JSON.stringify(reportData));
        ctx.stub.setEvent('createReportData', eventPayload);
    }

    @Transaction()
    public async deleteReportData(ctx: Context, reportID: string): Promise<void> {
        
        const reportDataExists = await this.reportDataExists(ctx, reportID);
        if (!reportDataExists) {
            throw new Error(`The report data with reportID ${reportID} does not exist`);
        }

        await ctx.stub.deleteState(reportID);
    }
    
    @Transaction(false)
    @Returns('boolean')
    public async reportDataExists(ctx: Context, reportID: string): Promise<boolean> {
        const reportData = await ctx.stub.getState(reportID);
        return reportData && reportData.length > 0;
    }

    @Transaction()
    public async createWorkData(ctx: Context, reportID: string, workType: string, contractorID: string, contractorName: string): Promise<void> {

        const reportDataBytes = await ctx.stub.getState(reportID);
        if (!reportDataBytes || reportDataBytes.length === 0) {
            throw new Error(`Report with ReportID ${reportID} does not exist`);
        }
        const reportData = JSON.parse(reportDataBytes.toString());

        const workID = crypto.randomBytes(4).toString('hex');

        const workData = new Work();
        workData.docType = 'WorkData';
        workData.workID = workID;
        workData.workType = workType;
        workData.sectionIDOfDefection = reportData.sectionIDOfDefection;
        workData.descriptionOfDefection = reportData.descriptionOfDefection;
        workData.imageHashOfDefection = reportData.imageHashOfDefection;
        workData.workStatus = "assigned"
        workData.assignToContractorID = contractorID;
        workData.assignToContractorName = contractorName;
        workData.reportID = reportID;

        const workDataAsBytes = Buffer.from(JSON.stringify(workData));
        await ctx.stub.putState(workID, workDataAsBytes);

        const eventPayload = Buffer.from(JSON.stringify(workData));
        ctx.stub.setEvent('createWorkData', eventPayload);
    }

    @Transaction()
    public async updateWorkStatus(ctx: Context, workID: string, newStatus: string): Promise<void> {
        const workDataBytes = await ctx.stub.getState(workID);
        if (!workDataBytes || workDataBytes.length === 0) {
            throw new Error(`WorkID ${workID} does not exist`);
        }
    
        const workData = JSON.parse(workDataBytes.toString());
        if (workData.docType !== 'WorkData') {
            throw new Error('Provided ID does not correspond to a valid Work object');
        }

        workData.workStatus = newStatus;

        const updatedWorkDataAsBytes = Buffer.from(JSON.stringify(workData));
        await ctx.stub.putState(workID, updatedWorkDataAsBytes);

        const eventPayload = Buffer.from(JSON.stringify(workData));
        ctx.stub.setEvent('updateWorkStatus', eventPayload);
    }

    @Transaction()
    public async createRewardData(ctx: Context): Promise<void> {
        const transientMap = ctx.stub.getTransient();
        const transientDataJSON = transientMap.get('report data');

        if (transientDataJSON.length === 0) {
            throw new Error('data properties not found in the transient map');
        }
        const jsonBytesToString = String.fromCharCode(...transientDataJSON);
        const jsonFromString = JSON.parse(jsonBytesToString);
        
        const data: Reward = {
            docType: "RewardData",
            rewardID: jsonFromString.rewardID,
            sectionID: jsonFromString.sectionID,
            workID: jsonFromString.workID,
            workStatus: "completed",
        };

        await ctx.stub.putState(data.rewardID, Buffer.from(JSON.stringify(data)));

        const eventPayload = Buffer.from(JSON.stringify(data));
        ctx.stub.setEvent('createRewardData', eventPayload);

        const userdata: UserPrivateData = {
            rewardID: jsonFromString.rewardID,
            reporterID: jsonFromString.reporterID,
            reporterName: jsonFromString.repoterName,
            reporterMobile: jsonFromString.reporterMobile,
            reporterBankAccount: jsonFromString.reporterBankAccount,
        };

        await ctx.stub.putPrivateData('rewardforuserPDC', data.rewardID, Buffer.from(stringify(sortKeysRecursive(userdata))));

        const companydata: ContractorPrivateData = {
            rewardID: jsonFromString.rewardID,
            contractorID: jsonFromString.contractorID,
            contractorName: jsonFromString.contractorName,
            contractorStaffName: jsonFromString.contractorStaffName,
            contractorStaffMobile: jsonFromString.contractorStaffMobile,
            contractorBankAccount: jsonFromString.contractorBankAccount,
        };

        await ctx.stub.putPrivateData('rewardforcontractorPDC', data.rewardID, Buffer.from(stringify(sortKeysRecursive(companydata))));

        return null;
    }
    
    @Transaction(false)
    public async getQueryResultForQueryString(ctx: Context, queryString: string): Promise<string> {
        const resultsIterator = await ctx.stub.getQueryResult(queryString);
        const results = await this.getAllResults(resultsIterator); 
        return JSON.stringify(results);
    }

    private async getAllResults(iterator): Promise<any[]> {
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value) {
                const jsonBytesToString = Buffer.from(res.value.value).toString('utf8');
                let record;
                try {
                    record = JSON.parse(jsonBytesToString);
                } catch (err) {
                    console.log(err);
                    record = { error: 'Failed to parse data', data: jsonBytesToString };
                }
                allResults.push(record);
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return allResults;
    }

    @Transaction(false)
    public async getReportDataByFMerID(ctx: Context, fmerID: string): Promise<string> {
        let queryString = {
            selector: {
                docType: 'ReportData',
                reportToFMerID: fmerID
            }
        };
        return this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    @Transaction(false)
    public async getAllWorkData(ctx: Context, docType: string = 'WorkData'): Promise<string> {
        let queryString = {
            selector: {
                docType: docType
            }
        };
        return this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    @Transaction(false)
    public async getWorkDataByReportID(ctx: Context, reportID: string): Promise<string> {
        let queryString = {
            selector: {
                docType: 'WorkData',
                reportID: reportID
            }
        };
        return this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    
    @Transaction(false)
    public async getWorkDataByContractorID(ctx: Context, contractorID: string): Promise<string> {
        let queryString = {
            selector: {
                docType: 'WorkData',
                assignToContractorID: contractorID
            }
        };
        return this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    @Transaction(false)
    public async getWorkStatusHistoryByWorkID(ctx: Context, workID: string): Promise<any[]> {
        const historyIterator = await ctx.stub.getHistoryForKey(workID);
        const results = [];
        while (true) {
            const result = await historyIterator.next();
            if (result.done) {
                await historyIterator.close();
                return results;
            }
            const keyMod = result.value;
            const resp: any = {
                timestamp: keyMod.timestamp,
                txid: keyMod.txId,
                isDelete: keyMod.isDelete.toString()
            };
            if (!keyMod.isDelete && keyMod.value && keyMod.value.length > 0) {
                try {
                    const jsonBytesToString = Buffer.from(keyMod.value).toString('utf8');
                    const data = JSON.parse(jsonBytesToString);
                    resp.data = data;
                    if (data && data.status) {
                        resp.statusChange = data.status;
                    }
                } catch (error) {
                    console.error('JSON parsing error:', error);
                    resp.data = null;
                    resp.error = 'Failed to parse data';
                }
            } else {
                resp.data = 'KEY DELETED';
            }
            results.push(resp);
        }
    }

    @Transaction(false)
    public async getWorkDataByWorkStatus(ctx: Context, workStatus: string): Promise<string> {
        let queryString = {
            selector: {
                docType: 'WorkData',
                workStatus: workStatus
            }
        };
        return this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    @Transaction(false)
    public async getReportDataByReportID(ctx: Context, reportID: string): Promise<string> {
        let queryString = {
            selector: {
                docType: 'ReportData',
                reportID: reportID
            }
        };
        return this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }
    
    @Transaction(false)
    public async getAllReportData(ctx: Context, docType: string = 'ReportData'): Promise<string> {
        let queryString = {
            selector: {
                docType: docType
            }
        };
        return this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    @Transaction(false)
    public async getAllRewardData(ctx: Context, docType: string = 'RewardData'): Promise<string> {
        let queryString = {
            selector: {
                docType: docType
            }
        };
        return this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }
    
    @Transaction(false)
    public async getAllData(ctx: Context): Promise<string> {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            if (result.value && result.value.value) {
                const jsonBytesToString = String.fromCharCode(...result.value.value);
                let record;
                try {
                    record = JSON.parse(jsonBytesToString);
                } catch (err) {
                    console.log(err);
                    record = { error: 'Failed to parse data', data: jsonBytesToString };
                }
                allResults.push(record);
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
    
    @Transaction(false)
    public async getRewardPrivateDataByRewardID(ctx: Context, collection: string, rewardID: string): Promise<any> {
        const privateDataBytes = await ctx.stub.getPrivateData(collection, rewardID);
        if (!privateDataBytes || privateDataBytes.length === 0) {
            throw new Error(`No private data found for rewardID ${rewardID}`);
        }
        const privateDetail = JSON.parse(privateDataBytes.toString());
        return privateDetail;
    }
}
