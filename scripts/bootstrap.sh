#!/bin/bash
set -e

cargo install diesel_cli --no-default-features --features postgres
cd ./packages/teg-auth/
diesel setup

yarn
yarn make-dirs

cd ../teg-web-ui/
yarn

cd ../teg-host-posix/
yarn create-config
