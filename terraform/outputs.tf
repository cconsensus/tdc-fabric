output "ssh-with-instance-user" {
  value = format(
    "\nssh -i %s -l %s %s\n",
    local_file.ssh_private_key.filename,
    "cconsensus",
    oci_core_instance._[1].public_ip
  )
}

output "ssh-with-ubuntu-user" {
  value = join(
    "\n",
    [for i in oci_core_instance._ :
      format(
        "ssh -l ubuntu -p 22 -i %s %s # %s",
        local_file.ssh_private_key.filename,
        i.public_ip,
        i.display_name
      )
    ]
  )
}
