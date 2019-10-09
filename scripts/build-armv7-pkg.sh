#!/bin/bash
set -e

echo "Building Teg PKG $TEG_VERSION for ARMv7: Ignore the warnings and scary yellow text. This is not a pretty process."
USER=`whoami`
GIT_BRANCH=`git branch | grep \* | cut -d ' ' -f2`

echo "Remotely building Teg"
ssh $TEG_ARMV7_HOST -p $TEG_ARMV7_PORT "
  rm -f ~/teg/teg;
  cd teg && \
  git checkout $GIT_BRANCH && \
  git pull origin $GIT_BRANCH && \
  nvm use && \
  npm install -g yarn && yarn bootstrap \
  && yarn pkg:build
"
echo "Remotely building Teg [DONE]"

cd ./snap/teg-armv7-bin
rm -rf ./node_modules
rm -rf ./teg

rsync -e "ssh -p $TEG_ARMV7_PORT" --chown=$USER:$USER -a --include="*.node" --include="*/" --exclude="*" --prune-empty-dirs $TEG_ARMV7_HOST:~/teg/node_modules ./
rsync -e "ssh -p $TEG_ARMV7_PORT" --chown=$USER:$USER -a $TEG_ARMV7_HOST:~/teg/teg ./

echo "\n\nBUILD COMPLETE (don't worry about the warnings and yellow text they are probably fine)"
