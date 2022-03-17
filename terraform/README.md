# OCI - ARM INSTANCE 

This is a Terraform configuration to deploy a instances on
[Oracle Cloud Infrastructure][oci]. 

By default, it deploys a 1-node using any oracle shape (currently "VM.Standard.E2.1" # AMD Sao Paulo). Each machine
has 1 OCPU and 8 GB of RAM, which means that the cluster fits within
Oracle's (pretty generous if you ask me) [free tier][freetier].
## Getting started

1. Create an Oracle Cloud Infrastructure account (just follow [this link][createaccount]).
2. Have installed or [install terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli?in=terraform/oci-get-started).
3. Have installed or [install OCI CLI ](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm).
4. Configure [OCI credentials](https://learn.hashicorp.com/tutorials/terraform/oci-build?in=terraform/oci-get-started).
5. Download this project and enter its folder.
6. `terraform init`
7. `terraform apply`

That's it!

At the end of the `terraform apply`, 

## Stopping the cluster

`terraform destroy`
