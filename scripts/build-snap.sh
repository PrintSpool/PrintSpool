#!/bin/bash
set -e

mkdir -p ./dist
rm -f ./dist/*.snap

echo "$SKIP_PKG"
if test -z "$SKIP_PKG" 
then
  ./scripts/build-armv7-pkg.sh
  ./scripts/build-x64-pkg.sh
else
  echo "\n\$SKIP_PKG detected. Reusing previous pkg builds. NodeJS changes will *not* be included in this build."
fi

echo "\nBuilding teg-marlin...\n\n"
yarn tegmarlin:build:x64
yarn tegmarlin:build:armv7
echo "\n\nBuilding teg-marlin... [DONE]\n"

echo "\nBuilding teg-auth...\n\n"
yarn tegauth:build:x64
yarn tegauth:build:armv7
echo "\n\nBuilding teg-auth... [DONE]\n"

TEG_VERSION=`node -e "console.log(require('./packages/teg-core/package.json').version);"`;

cd ./snap

sed -i -E "s/^version:[^\n]+/version: $TEG_VERSION/g" ./snapcraft.yaml

# snapcraft clean
# snapcraft clean teg
#
# snapcraft --debug

snapcraft remote-build --launchpad-accept-public-upload

mv ./*.snap ../dist/
