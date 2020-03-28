#!/bin/bash
set -e

yarn make-dirs
yarn

cd ../teg-web-ui/
yarn

cd ../teg-host-posix/
yarn create-config
