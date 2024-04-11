/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { connect, ConnectOptions, Gateway, Identity, Signer, signers, checkpointers } from '@hyperledger/fabric-gateway';
import WebSocket from 'ws';
import {
    keyDirectoryPathOrg2, certPathOrg2, tlsCertPathOrg2, peerEndpointOrg2, peerNameOrg2,
    newGrpcConnection, newIdentity, newSigner
} from './connect';

const channelName = 'mychannel';
const chaincodeName = 'basic'; 
const mspIdOrg2 = 'Org2MSP'

async function main(): Promise<void> {
    const client = await newGrpcConnection(tlsCertPathOrg2, peerEndpointOrg2, peerNameOrg2);
    const identity = await newIdentity(certPathOrg2, mspIdOrg2);
    const signer = await newSigner(keyDirectoryPathOrg2);

    const connectOptions: ConnectOptions = {
        client,
        identity,
        signer,
    };

    const gateway = connect(connectOptions);
    const network = gateway.getNetwork(channelName);

    const ws = new WebSocket('ws://localhost:7890');

    ws.on('open', () => {
        console.log('Connected to the WebSocket server');
    });

    const appIdMapping: { [key: string]: string } = {
        createReportData: '1-3',
        createWorkData: '2-3',
        updateWorkStatus: '2-5',
        createRewardData: '3-3',
    };    

    const checkpointer = checkpointers.inMemory();

    while (true) {
        const events = await network.getChaincodeEvents(chaincodeName, {
            checkpoint: checkpointer,
            startBlock: BigInt(0), // Ignored if the checkpointer has checkpoint state
        });
        try {
            for await (const event of events) {
                const appId = appIdMapping[event.eventName] || 'unknown';
                const dataString = Buffer.from(event.payload).toString();
                const dataObject = JSON.parse(dataString);

                const message = JSON.stringify({
                    appId,
                    eventName: event.eventName,
                    data: dataObject,
                });
                ws.send(message);
                await checkpointer.checkpointChaincodeEvent(event);
            }
        } catch (err) {
            console.error('Error receiving chaincode events:', err);
            // Handle connection error or other issues
        } finally {
            events.close();
        }
    }
}

main().catch(error => {
    console.error('******** Error occurred:', error);
});
