#!/bin/bash
# ----------
# SPDX-License-Identifier: Apache-2.0
# ----------
#
docker-compose -f ./docker-compose-dapps.yaml up -d

sleep 3

docker ps -a --filter "name=tdcorg"
