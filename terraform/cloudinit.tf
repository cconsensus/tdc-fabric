locals {
  packages = [
    "apt-transport-https",
    "build-essential",
    "ca-certificates",
    "curl",
    "docker.io",
    "jq",
    "kubeadm",
    "kubelet",
    "lsb-release",
    "make",
    "prometheus-node-exporter",
    "python3-pip",
    "software-properties-common",
    "tmux",
    "tree",
    "unzip",
  ]
}

data "cloudinit_config" "_" {
  for_each = local.nodes

  part {
    filename     = "cloud-config.cfg"
    content_type = "text/cloud-config"
    content      = <<-EOF
      hostname: ${each.value.node_name}
      package_update: true
      package_upgrade: false
      packages:
      ${yamlencode(local.packages)}
      users:
      - default
      - name: cconsensus
        primary_group: cconsensus
        groups: docker
        home: /home/cconsensus
        shell: /bin/bash
        sudo: ALL=(ALL) NOPASSWD:ALL
        ssh_authorized_keys:
        - ${tls_private_key.ssh.public_key_openssh}
      write_files:
      - path: /home/cconsensus/.ssh/id_rsa
        defer: true
        owner: "cconsensus:cconsensus"
        permissions: "0600"
        content: |
          ${indent(4, tls_private_key.ssh.private_key_pem)}
      - path: /home/cconsensus/.ssh/id_rsa.pub
        defer: true
        owner: "cconsensus:cconsensus"
        permissions: "0600"
        content: |
          ${indent(4, tls_private_key.ssh.public_key_openssh)}
      EOF
  }

  # By default, all inbound traffic is blocked
  # (except SSH) so we need to change that.
  part {
    filename     = "allow-inbound-traffic.sh"
    content_type = "text/x-shellscript"
    content      = <<-EOF
      #!/bin/sh
      sed -i "s/-A INPUT -j REJECT --reject-with icmp-host-prohibited//" /etc/iptables/rules.v4 
      netfilter-persistent start
    EOF
  }
}
