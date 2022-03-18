# Repository CCONSENSUS cc_tdc_fabric

Dapp and simple API developed for the **The Developers Conference 2022 (TDC Connections Brasil)**.

## VERSION AND HINTS

This is a Typescript NodeJS / Express developed API dApp. Tested with Hyperledger Fabric Test Network of
[Fabric Samples](https://github.com/hyperledger/fabric-samples) running Hyperledger Fabric version 2.4.2:
This project was deployed and tested using Oracle Cloud provisioned using Terraform. We used less deployment automation
just to be able to understand the complete process of running hyperledger fabric.

*Peer version:*

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

## Dependencies:

- Redis container for asynchronous tasks:

```shell
# look for .env user password configuration.
# for development pourposes, will run this container on the same network of fabric samples
$ docker run --network fabric_test -p 6379:6379 --hostname redis.cconsensus.com.br --name redis.cconsensus.com.br -d redis --maxmemory-policy noeviction --requirepass dckdadekkkkd39489843AdTDChjÇ
```

## How to run:

```shell
$ npm install
$ tsc
$ npm run start-node
```

or for development:

```shell
$ npm install
$ npm run dev-dapp
```

## Build docker image:

```shell
$ docker build --tag cconsensus/dapp_tdc_fabric:1.0.0 .
```

## Run image using docker:

```shell
$ docker run -p 4444:4444 --hostname dapp.cconsensus.com.br  --name dapp.cconsensus.com.br --network fabric_test -it cconsensus/dapp_tdc_fabric:1.0.0
```

## Run image using docker compose:

```shell
$ docker-compose -f ./docker-compose-dapps.yaml up -d
```


