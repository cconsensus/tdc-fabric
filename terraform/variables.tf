variable "root_compartment_id" {
  type = string
}
variable "name" {
  type    = string
  default = "tdc-oracle"
}

variable "description" {
  type    = string
  default = "tdc-oracle"
}

/*
Available flex shapes:
"VM.Optimized3.Flex"  # Intel Ice Lake
"VM.Standard3.Flex"   # Intel Ice Lake
"VM.Standard.A1.Flex" # Ampere Altra
"VM.Standard.E3.Flex" # AMD Rome
"VM.Standard.E4.Flex" # AMD Ashburn
"VM.Standard.E2.1"    # AMD Sao Paulo
*/

variable "shape" {
  type    = string
  default = "VM.Standard.E2.1"
}

variable "how_many_nodes" {
  type    = number
  default = 1
}

variable "availability_domain" {
  type    = number
  default = 0
}

variable "ocpus_per_node" {
  type    = number
  default = 1
}

variable "memory_in_gbs_per_node" {
  type    = number
  default = 8
}
