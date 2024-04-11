/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { connect, Contract, Gateway } from '@hyperledger/fabric-gateway';
import * as readline from 'readline';
import { TextDecoder } from 'util';
import {
    keyDirectoryPathOrg1, certPathOrg1, tlsCertPathOrg1, peerEndpointOrg1, peerNameOrg1,
    keyDirectoryPathOrg2, certPathOrg2, tlsCertPathOrg2, peerEndpointOrg2, peerNameOrg2,
    keyDirectoryPathOrg3, certPathOrg3, tlsCertPathOrg3, peerEndpointOrg3, peerNameOrg3,
    newGrpcConnection, newIdentity, newSigner
} from './connect';

const utf8Decoder = new TextDecoder();

const mspIdOrg1 = 'Org1MSP';
const mspIdOrg2 = 'Org2MSP';
const mspIdOrg3 = 'Org3MSP';

const channelName = 'mychannel';
const chaincodeName = 'basic';

// Create a readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });  

// 사용자 입력에 따라 해당 MSP의 Gateway와 Contract 객체를 선택하는 함수
async function getContractForMSP(mspId: string): Promise<Contract> {
    let client;
    let gateway;
    let contract;

    switch (mspId) {
      case 'Org1MSP':
        client = await newGrpcConnection(tlsCertPathOrg1, peerEndpointOrg1, peerNameOrg1);
        gateway = connect({
          client: client,
          identity: await newIdentity(certPathOrg1, mspIdOrg1),
          signer: await newSigner(keyDirectoryPathOrg1),
        });
        contract = gateway.getNetwork(channelName).getContract(chaincodeName);
        break;
      case 'Org2MSP':
        client = await newGrpcConnection(tlsCertPathOrg2, peerEndpointOrg2, peerNameOrg2);
        gateway = connect({
          client: client,
          identity: await newIdentity(certPathOrg2, mspIdOrg2),
          signer: await newSigner(keyDirectoryPathOrg2),
        });
        contract = gateway.getNetwork(channelName).getContract(chaincodeName);
        break;
      case 'Org3MSP':
        client = await newGrpcConnection(tlsCertPathOrg3, peerEndpointOrg3, peerNameOrg3);
        gateway = connect({
          client: client,
          identity: await newIdentity(certPathOrg3, mspIdOrg3),
          signer: await newSigner(keyDirectoryPathOrg3),
        });
        contract = gateway.getNetwork(channelName).getContract(chaincodeName);
        break;
      default:
        throw new Error('Invalid MSP ID provided.');
    }
  
    return contract;
}

async function main(): Promise<void> {
    let contract: Contract;

    try {
        const mspId = await new Promise<string>((resolve) => {
            rl.question('Enter the MSP ID: ', resolve);
        });
        contract = await getContractForMSP(mspId);

        const functionToExecute = await new Promise<string>((resolve) => {
            rl.question('Enter the function to execute: ', resolve);
        });

        let fmerID, workID, workStatus, reportID, contractorID, collection, rewardID;

        switch (functionToExecute) {
            case "getReportDataByFMerID":
                if (mspId !== 'Org2MSP') {
                    console.log('This function is restricted to Org2MSP only.');
                    break;
                }
                fmerID = await new Promise<string>((resolve) => {
                    rl.question('Please enter the FMerID: ', resolve);
                });
                await getReportDataByFMerID(contract, fmerID);
                break;

            case "getAllWorkData":
                if (mspId !== 'Org2MSP') {
                    console.log('This function is restricted to Org2MSP only.');
                    break;
                }
                await getAllWorkData(contract, "WorkData");
                break;

            case "getWorkDataByReportID":
                reportID = await new Promise<string>((resolve) => {
                    rl.question('Please enter the ReportID: ', resolve);
                });
                await getWorkDataByReportID(contract, reportID);
                break;

            case "getWorkDataByContractorID":
                contractorID = await new Promise<string>((resolve) => {
                    rl.question('Please enter the contractorID: ', resolve);
                });
                await getWorkDataByContractorID(contract, contractorID);
                break;

            case "getWorkStatusHistoryByWorkID":
                workID = await new Promise<string>((resolve) => {
                    rl.question('Please enter the WorkID: ', resolve);
                });
                await getWorkStatusHistoryByWorkID(contract, workID);
                break;

            case "getWorkDataByWorkStatus":
                if (mspId !== 'Org2MSP') {
                    console.log('This function is restricted to Org2MSP only.');
                    break;
                }
                workStatus = await new Promise<string>((resolve) => {
                    rl.question('Please enter the WorkStatus: ', resolve);
                });
                await getWorkDataByWorkStatus(contract, workStatus);
                break;

            case "getReportDataByReportID":
                if (mspId !== 'Org2MSP') {
                    console.log('This function is restricted to Org2MSP only.');
                    break;
                }
                reportID = await new Promise<string>((resolve) => {
                    rl.question('Please enter the ReportID: ', resolve);
                });
                await getReportDataByReportID(contract, reportID);
                break;  

            case "getAllReportData":
                if (mspId !== 'Org2MSP') {
                    console.log('This function is restricted to Org2MSP only.');
                    break;
                }
                await getAllReportData(contract, "ReportData");
                break;

            case "getAllRewardData":
                if (mspId !== 'Org2MSP') {
                    console.log('This function is restricted to Org2MSP only.');
                    break;
                }
                await getAllRewardData(contract, "RewardData");
                break;

            case "getAllData":
                if (mspId !== 'Org2MSP') {
                    console.log('This function is restricted to Org2MSP only.');
                    break;
                }
                await getAllData(contract);
                break;
            
            case "getRewardPrivateDataByRewardID":
                collection = await new Promise<string>((resolve) => {
                    rl.question('Please enter the collection: ', resolve);
                });
                rewardID = await new Promise<string>((resolve) => {
                    rl.question('Please enter the rewardID: ', resolve);
                });
                await getRewardPrivateDataByRewardID(contract, collection, rewardID);
                break;

            default:
                console.log("Invalid function specified. Available functions: getReportDataByFMerID, getAllWorkData, getWorkDataByReportID, getWorkDataByContractorID, getWorkStatusHistoryByWorkID, getWorkDataByWorkStatus, getReportDataByReportID, getAllReportData, getAllRewardData, getAllData, getRewardPrivateDataByRewardID");
        }
    } catch (error) {
        console.error('******** Error occured:', error);
    } finally {
        rl.close();
    }
}

main().catch(error => {
    console.error('******** Error occured:', error);
});


async function getReportDataByFMerID(contract: Contract, fmerID: string): Promise<void> {
    console.log(`\n--> Evaluate Transaction: getReportDataByFMerID, function queries ReportData by the FMerID: ${fmerID}`);
    const resultBytes = await contract.evaluateTransaction('getReportDataByFMerID', fmerID);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

async function getAllWorkData(contract: Contract, doctype: string): Promise<void> {
    console.log(`\n--> Evaluate Transaction: getAllWorkData, function queries WorkData`);
    const resultBytes = await contract.evaluateTransaction('getAllWorkData', doctype);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

async function getWorkDataByReportID(contract: Contract, reportID: string): Promise<void> {
    console.log(`\n--> Evaluate Transaction: getWorkDataByReportID, function queries WorkData by the ReportID: ${reportID} `);
    const resultBytes = await contract.evaluateTransaction('getWorkDataByReportID', reportID);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

async function getWorkDataByContractorID(contract: Contract, contractorID: string): Promise<void> {
    console.log(`\n--> Evaluate Transaction: getWorkDataByContractorID, function queries WorkData by the ContractorID: ${contractorID}`);
    const resultBytes = await contract.evaluateTransaction('getWorkDataByContractorID', contractorID);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

async function getWorkStatusHistoryByWorkID(contract: Contract, workID: string): Promise<void> {
    console.log(`\n--> Evaluate Transaction: getWorkStatusHistoryByWorkID, function queries WorkData of Status history by the WorkID: ${workID}`);
    const resultBytes = await contract.evaluateTransaction('getWorkStatusHistoryByWorkID', workID);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

async function getWorkDataByWorkStatus(contract: Contract, workStatus: string): Promise<void> {
    console.log(`\n--> Evaluate Transaction: getByRequestID, function queries WorkData by the WorkStatus: ${workStatus}`);
    const resultBytes = await contract.evaluateTransaction('getWorkDataByWorkStatus', workStatus);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

async function getReportDataByReportID(contract: Contract, reportID: string): Promise<void> {
    console.log(`\n--> Evaluate Transaction: getReportDataByReportID, function queries ReportData by the ReportID: ${reportID}`);
    const resultBytes = await contract.evaluateTransaction('getReportDataByReportID', reportID);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

async function getAllReportData(contract: Contract, doctype: string): Promise<void> {
    console.log(`\n--> Evaluate Transaction: getAllReportData, function queries ReportData`);
    const resultBytes = await contract.evaluateTransaction('getAllReportData', doctype);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

async function getAllRewardData(contract: Contract, doctype: string): Promise<void> {
    console.log(`\n--> Evaluate Transaction: getAllRewardData, function queries RewardData`);
    const resultBytes = await contract.evaluateTransaction('getAllRewardData', doctype);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

async function getAllData(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: getAllData, function retrieves all data on the ledger');
    const resultBytes = await contract.evaluateTransaction('getAllData');
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    if(result.length === 0) {
        console.log('*** No data found in the ledger.');
    } else {
        console.log('*** Result:', result);
    }
}

async function getRewardPrivateDataByRewardID(contract: Contract, collection: string, rewardID: string): Promise<void> {
    console.log(`\n--> Evaluate Transaction: getRewardPrivateDataByRewardID, function queries private datalist by the rewardID: ${rewardID}`);
    const resultBytes = await contract.evaluateTransaction('getRewardPrivateDataByRewardID', collection, rewardID);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}
