## terminal 1
cd ~/go/src/github.com/yoojeongim/fabric-samples/test-network

./network.sh down

#couch DB 설정, 채널, CA 설정

./network.sh up createChannel -c mychannel -ca -s couchdb


cd addOrg3

#조직에 채널 추가

./addOrg3.sh up -c mychannel -ca -s couchdb

cd ../../asset-transfer-private-data/chaincode-typescript
npm install(안해도 됨)
npm run build

cd ../../test-network

#체인코드 배포, 승인, 설치
./network.sh deployCC -ccn basic -ccp ../asset-transfer-private-data/chaincode-typescript/ -ccl typescript -ccep "OR('Org1MSP.peer','Org2MSP.peer','Org3MSP.peer')" -cccg ../asset-transfer-private-data/chaincode-typescript/collections_config.json
 
export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/org1.example.com/
fabric-ca-client register --caname ca-org1 --id.name User --id.secret Userpw --id.type client --tls.certfiles "${PWD}/organizations/fabric-ca/org1/tls-cert.pem"
fabric-ca-client enroll -u https://User:Userpw@localhost:7054 --caname ca-org1 -M "${PWD}/organizations/peerOrganizations/org1.example.com/users/User@org1.example.com/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/org1/tls-cert.pem"
cp "${PWD}/organizations/peerOrganizations/org1.example.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/org1.example.com/users/User@org1.example.com/msp/config.yaml"
export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/org2.example.com/
fabric-ca-client register --caname ca-org2 --id.name FMer --id.secret FMerpw --id.type client --tls.certfiles "${PWD}/organizations/fabric-ca/org2/tls-cert.pem"
fabric-ca-client enroll -u https://FMer:FMerpw@localhost:8054 --caname ca-org2 -M "${PWD}/organizations/peerOrganizations/org2.example.com/users/FMer@org2.example.com/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/org2/tls-cert.pem"
cp "${PWD}/organizations/peerOrganizations/org2.example.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/org2.example.com/users/FMer@org2.example.com/msp/config.yaml"
export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/org3.example.com/
fabric-ca-client register --caname ca-org3 --id.name Contractor --id.secret Contractorpw --id.type client --tls.certfiles "${PWD}/addOrg3/fabric-ca/org3/tls-cert.pem"
fabric-ca-client enroll -u https://Contractor:Contractorpw@localhost:11054 --caname ca-org3 -M "${PWD}/organizations/peerOrganizations/org3.example.com/users/Contractor@org3.example.com/msp" --tls.certfiles "${PWD}/addOrg3/fabric-ca/org3/tls-cert.pem"
cp "${PWD}/organizations/peerOrganizations/org3.example.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/org3.example.com/users/Contractor@org3.example.com/msp/config.yaml"

cd ../asset-transfer-private-data/application-gateway-typescript

npm install
node dist/appr.js

## terminal 2
cd ~/go/src/github.com/yoojeongim/websocket-server
node server.js

## terminal 3
cd ~/go/src/github.com/yoojeongim/interface
node interface.js

## terminal 4
cd ~/go/src/github.com/yoojeongim/interface
node interface2.js

## terminal 5
cd ~/go/src/github.com/yoojeongim/fabric-samples/asset-transfer-private-data/application-gateway-typescript
node dist/appw.js

## terminal 6
cd ~/go/src/github.com/yoojeongim/fabric-samples/asset-transfer-private-data/application-gateway-typescript
node dist/appw2.js

## terminal 7
cd ~/go/src/github.com/yoojeongim/fabric-samples/asset-transfer-private-data/application-gateway-typescript
node dist/appw3.js

## terminal 8
cd ~/go/src/github.com/yoojeongim/fabric-samples/asset-transfer-private-data/application-gateway-typescript
node dist/listen.js
