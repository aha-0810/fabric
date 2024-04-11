/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { connect, Contract, Gateway } from '@hyperledger/fabric-gateway';
import * as readline from 'readline';
import {
    keyDirectoryPathOrg2, certPathOrg2, tlsCertPathOrg2, peerEndpointOrg2, peerNameOrg2,
    newGrpcConnection, newIdentity, newSigner
} from './connect';

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspIdOrg2 = 'Org2MSP';

async function createWorkData(contract: Contract, reportID: string, workType: string, contractorID: string, contractorName: string): Promise<void> {
    console.log(`\n--> Submit Transaction: createWorkData`);

    try {
        const result = await contract.submitTransaction('createWorkData', reportID, workType, contractorID, contractorName);
        console.log(`*** Result: committed, ${result.toString()}`);
    } catch (error) {
        console.error(`Failed to submit createData transaction: ${error}`);
    }
}

async function updateWorkStatus(contract: Contract, workID: string, workStatus: string): Promise<void> {
    console.log(`\n--> Submit Transaction: updateWorkStatus`);

    try {
        await contract.submitTransaction('updateWorkStatus', workID, workStatus);
        console.log(`*** Result: Status for ${workID} updated to ${workStatus}`);
    } catch (error) {
        console.error(`Failed to submit updateStatus transaction: ${error}`);
    }
}

async function deleteReportData(contract: Contract, reportID: string) : Promise<void> {
    console.log(`\n--> Submit Transaction: deleteReportData`);

    try {
        const result = await contract.submitTransaction('deleteReportData', reportID);
        console.log(`*** Result: committed, ${result.toString()}`);
    } catch (error) {
        console.error(`Failed to submit deleteReportData transaction: ${error}`);
    }
}

// Create a readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

async function main(): Promise<void> {
    const clientOrg2 = await newGrpcConnection(tlsCertPathOrg2, peerEndpointOrg2, peerNameOrg2);

    const gatewayOrg2 = connect({
        client: clientOrg2,
        identity: await newIdentity(certPathOrg2, mspIdOrg2),
        signer: await newSigner(keyDirectoryPathOrg2),
    });

    const contractOrg2 = gatewayOrg2.getNetwork(channelName).getContract(chaincodeName);

    try {
        const functionToExecute = await new Promise<string>((resolve) => {
            rl.question('Enter the function to execute: ', resolve);
        });

        let reportID, workType, contractorID, contractorName, workID, workStatus;

        switch (functionToExecute) {
            case "createWorkData":
                reportID = await new Promise<string>((resolve) => {
                    rl.question('Please enter the ReportID: ', resolve);
                });
                workType = await new Promise<string>((resolve) => {
                    rl.question('Please enter the WorkType: ', resolve);
                });
                contractorID = await new Promise<string>((resolve) => {
                    rl.question('Please enter the ContractorID: ', resolve);
                });
                contractorName = await new Promise<string>((resolve) => {
                    rl.question('Please enter the ContractorName: ', resolve);
                });
                await createWorkData(contractOrg2, reportID, workType, contractorID, contractorName);
                break;

            case "updateWorkStatus":
                workID = await new Promise<string>((resolve) => {
                    rl.question('Please enter the WorkID: ', resolve);
                });
                workStatus = await new Promise<string>((resolve) => {
                    rl.question('Please enter the WorkStatus: ', resolve);
                });
                await updateWorkStatus(contractOrg2, workID, workStatus);
                break;

            case "deleteReportData":
                reportID = await new Promise<string>((resolve) => {
                    rl.question('Please enter the ReportID to delete: ', resolve);
                });
                await deleteReportData(contractOrg2, reportID);
                break;

            default:
                console.log("Invaild function specified. Available functions: createWorkData, updateWorkStatus, createRewardData")
        }
    } catch (error) {
        console.error('******** Error occured:', error);
    } finally {
        rl.close();
    }
}

main().catch(error => {
console.error('******** Error occurred:', error);
});
