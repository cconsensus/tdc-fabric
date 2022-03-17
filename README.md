# CCONSENSUS TDC FABRIC

Hyperledger Fabric Smart Contract for The Developers Conference presentation.

**Developed by**: David Reis

**Contact**: davidfdr@gmail.com / david@cconsensus.com.br

**URL**: https://www.cconsensus.com.br/home/

## VERSION AND HINTS

This is a Typescript NodeJS repository. Tested with Hyperledger Fabric Test Network of
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