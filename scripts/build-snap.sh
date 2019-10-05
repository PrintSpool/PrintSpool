#!/bin/bash
set -e

mkdir -p ./dist
rm -f ./dist/*.snap

echo "\nBuilding teg-marlin...\n\n"
yarn tegmarlin:build:x64
yarn tegmarlin:build:armv7
echo "\n\nBuilding teg-marlin... [DONE]\n"

cd ./snap

snapcraft remote-build --accept-public-upload

mv ./*.snap ../dist/
