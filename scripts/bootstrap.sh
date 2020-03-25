#!/bin/bash
set -e

cargo install diesel_cli --no-default-features --features postgres
cd ./packages/teg-auth/
diesel setup

yarn make-dirs
yarn

cd ../teg-web-ui/
yarn

cd ../teg-host-posix/
yarn create-config
