/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { connect, Contract, Gateway } from '@hyperledger/fabric-gateway';
import WebSocket from 'ws';
import {
    keyDirectoryPathOrg2, certPathOrg2, tlsCertPathOrg2, peerEndpointOrg2, peerNameOrg2,
    newGrpcConnection, newIdentity, newSigner
} from './connect';

const channelName = 'mychannel';
const chaincodeName = 'basic'; 
const mspIdOrg2 = 'Org2MSP';

async function createReportData(contract: Contract, reportDataJson: string): Promise<void> {
    console.log(`\n--> Submit Transaction: createReportData`);

    try {
        const result = await contract.submitTransaction('createReportData', reportDataJson);
        console.log(`*** Result: committed, ${result.toString()}`);
    } catch (error) {
        console.error(`Failed to submit createData transaction: ${error}`);
    }
}

async function main(): Promise<void> {
    const clientOrg2 = await newGrpcConnection(tlsCertPathOrg2, peerEndpointOrg2, peerNameOrg2);

    const gatewayOrg2 = connect({
        client: clientOrg2,
        identity: await newIdentity(certPathOrg2, mspIdOrg2),
        signer: await newSigner(keyDirectoryPathOrg2),
    });

    const contractOrg2 = gatewayOrg2.getNetwork(channelName).getContract(chaincodeName);

    const ws = new WebSocket('ws://0.0.0.0:7890');

    // WebSocket message handling
    ws.on('open', () => {
        console.log('Connected to WebSocket server.');
    });

    // Handle received messages from WebSocket
    ws.on('message', async (message) => {
        try {
            const messageString = message.toString();
            const repdata = JSON.parse(messageString);
            if (repdata.appId === '1-2') {
                const reportData = {
                    reportID: repdata.reportID,
                    reporterID: repdata.reporterID,
                    sectionIDOfDefection: repdata.sectionID,
                    descriptionOfDefection: repdata.description,
                    imageHashOfDefection: repdata.imageHash,
                    reportToFMerID: repdata.fmerID,
                    reportToFMerName: repdata.fmerName
                };

                const reportDataJson = JSON.stringify(reportData);
                await createReportData(contractOrg2, reportDataJson);
            }
        } catch (error) {
            console.error('Failed to process message:', error);
        }
    });    

    // Handle WebSocket errors and closure
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed.');
    });
}

// Run the main function
main().catch(error => {
    console.error('******** Error occurred:', error);
    });