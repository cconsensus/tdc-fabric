# Repository CCONSENSUS cc_tdc_fabric

Hyperledger Fabric Smart Contract for **The Developers Conference 2022 (TDC Connections Brasil)**  presentation.

## VERSION AND HINTS

This is a Typescript NodeJS developed chaincode. Tested with Hyperledger Fabric Test Network of
[Fabric Samples](https://github.com/hyperledger/fabric-samples) running Hyperledger Fabric version 2.4.2:
This project was deployed and tested using Oracle Cloud provisioned using Terraform.
We used less deployment automation just to be able to understand the complete process of running hyperledger fabric.

```shell
cconsensus@node1:~$ peer version
peer:
 Version: 2.4.2
 Commit SHA: fad7f691a
 Go version: go1.17.5
 OS/Arch: linux/amd64
 Chaincode:
  Base Docker Label: org.hyperledger.fabric
  Docker Namespace: hyperledger

cconsensus@node1:~$
```

## BRING NETWORK UP

```shell
./network.sh up createChannel -ca -c mychannel -s couchdb
./addOrg3.sh up -ca -c mychannel -s couchdb
```

### ORG VARIABLES

-> Assuming usage of test network of fabric samples.

#### ORG1

```shell
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

#### ORG2

```shell
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051
```

#### ORG3

```shell
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
export CORE_PEER_ADDRESS=localhost:11051
```

### BUILD NODE PACKAGE:

Go to the package.json directory (assuming that you have setup nodeJS / npm )

```shell
npm install
```

or

```shell
npm install --no-bin-links (Windows host with vagrant filesystem)
```

### PACKAGE:

```shell
peer lifecycle chaincode package idauth.tar.gz --path /vagrant/go/src/github.com/hyperledger/davidfdr/cconsensus_identity/chaincode/cc_idauth --lang node --label idauth1.1.0

peer lifecycle chaincode package idauth.tar.gz --path /home/cconsensus/go/src/github.com/cconsensus/cconsensus_identity/chaincode/cc_idauth --lang node --label idauth1.0.0
```

### INSTALL:

```shell
peer lifecycle chaincode install idauth.tar.gz
```

### APROVE FOR ORG

```shell
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
--channelID mychannel --name idauth --sequence 1 --version 1.0.0 \
--package-id  idauth1.0.0:f0f0a7e8fd78a54881488e9d8ebbcdce534191e8dcc4e166fcc4f20c3284a891 \
--tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```

### COMMIT

```shell
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel \
--name idauth --version 1.0.0 --sequence 1 --tls \
--cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
--peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
--peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
--peerAddresses localhost:11051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
```

### TROUBLESHOOTING CHECK CHAINCODE

```shell
peer lifecycle chaincode queryinstalled
peer lifecycle chaincode querycommitted --channelID mychannel
peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name regcon --version 1.0.5 --sequence 5 \
--tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
--output json \
| jq .
```

### CHAINCODE RULES

All operations that query identities or updates the ledger must have de following attribute enrolled to the certificate:

- name: identityAuthService
- value: true







