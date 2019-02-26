#!/bin/sh
set -e

mkdir -p ./dist
rm -f ./dist/*.snap
./scripts/build-armv7-snap.sh
./scripts/build-x64-snap.sh
