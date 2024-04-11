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

async function createRewardData(contract: Contract, transientData: { [key: string]: Buffer }): Promise<void> {
    console.log(`\n--> Submit Transaction: createRewardData`);

    try {
        const result = await contract.submit('createRewardData', {transientData});
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

    ws.on('message', async (message) => {
        try {
            const messageString = message.toString();
            const rewData = JSON.parse(messageString);
            if (rewData.appId === '3-2') {
                // Prepare transient data for the transaction
                const transientData = {
                    'report data': Buffer.from(JSON.stringify({
                        rewardID: rewData.rewardID,
                        sectionID: rewData.sectionID,
                        workID: rewData.workID,
                        reporterID: rewData.reporterID,
                        reporterName: rewData.reporterName, 
                        reporterMobile: rewData.reporterMobile,
                        reporterBankAccount: rewData.reporterBankAccount,
                        contractorID: rewData.contractorID,
                        contractorName: rewData.contractorName,
                        contractorStaffName: rewData.contractorStaffName,
                        contractorStaffMobile: rewData.contractorStaffMobile,
                        contractorBankAccount: rewData.contractorBankAccount
                    })),
                };

                await createRewardData(contractOrg2, transientData);
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
