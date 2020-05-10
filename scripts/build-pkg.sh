#!/bin/bash
set -e

TEG_VERSION=`node -e "console.log(require('./packages/teg-core/package.json').version);"`;
ARCH=`uname -m`

if [ "$s1" == "amd64" ]
then
  export PKG_ARCH="x64"
else
  export PKG_ARCH="armv7"
fi

echo "Building Teg PKG $TEG_VERSION for $ARCH: Ignore the warnings and scary yellow text. This is not a pretty process."

npx gulp babel:build

pushd
cd ./packages/teg-host-posix/
pkg -t node10-linux-${PKG_ARCH} ./dist/index.js -o ../../teg
popd

cd ./snap/teg-bin
rm -rf ./node_modules
rm -rf ./teg

mv ../../teg ./

rsync -a --include="*.node" --include="*/" --exclude="*" --prune-empty-dirs ../../node_modules ./

echo "\n\nBUILD COMPLETE (don't worry about the warnings and yellow text they are probably fine)"
