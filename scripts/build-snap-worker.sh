#!/bin/bash
set -e

ARCH=`dpkg --print-architecture`

echo "start build-snap-worker (arch: $ARCH)"

echo "$SKIP_PKG"
if test -z "$SKIP_PKG" 
then
  ./scripts/build-pkg.sh
else
  echo "\n\$SKIP_PKG detected. Reusing previous pkg builds. NodeJS changes will *not* be included in this build."
fi

TEG_VERSION=`node -e "console.log(require('./packages/teg-core/package.json').version);"`;

cd ./snap

sed -i -E "s/^version:[^\n]+/version: $TEG_VERSION/g" ./snapcraft.yaml

snapcraft clean
snapcraft clean teg

snapcraft --debug
