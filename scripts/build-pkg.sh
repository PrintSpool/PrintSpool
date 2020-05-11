#!/bin/bash
set -e

TEG_VERSION=`node -e "console.log(require('./packages/teg-core/package.json').version);"`;
ARCH=`dpkg --print-architecture`

if [ "$ARCH" == "amd64" ]
then
  export PKG_ARCH="x64"
else
  export PKG_ARCH="armv7"
fi

TEG_BIN="./snap/teg-server-bin/$PKG_ARCH/"

echo "Building Teg PKG $TEG_VERSION for $PKG_ARCH: Ignore the warnings and scary yellow text. This is not a pretty process."

npx gulp babel:build

pushd .
cd ./packages/teg-host-posix/
npx pkg -t node10-linux-${PKG_ARCH} ./dist/index.js -o ../../teg
popd

rm -rf $TEG_BIN
mkdir -p $TEG_BIN

mv ./teg $TEG_BIN

rsync -a --include="*.node" --include="*/" --exclude="*" --prune-empty-dirs ./node_modules $TEG_BIN

echo "\n\nBUILD COMPLETE (don't worry about the warnings and yellow text they are probably fine)"
