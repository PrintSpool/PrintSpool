#!/bin/bash
set -e

teg_VERSION=`node -e "console.log(require('./packages/teg-core/package.json').version);"`;

echo "Building Teg PKG $teg_VERSION for X64: Ignore the warnings and scary yellow text. This is not a pretty process."

yarn pkg:build

cd ./snap/teg-x64-bin
rm -rf ./node_modules
rm -rf ./teg

mv ../../teg ./

rsync -a --include="*.node" --include="*/" --exclude="*" --prune-empty-dirs ../../node_modules ./

echo "\n\nBUILD COMPLETE (don't worry about the warnings and yellow text they are probably fine)"
