#!/bin/sh
set -e

TEGH_VERSION=`node -e "console.log(require('./packages/tegh-core/package.json').version);"`;
echo "\e[32mSnapping Tegh $TEGH_VERSION for armv7:\e[0m Ignore the warnings and scary yellow text. This is not a pretty process.\n"
USER=`whoami`

echo "Remotely building Tegh"
ssh $TEGH_ARMV7_HOST -p $TEGH_ARMV7_PORT 'cd tegh && nvm use && git checkout master && git pull origin master && yarn bootstrap && yarn build-dev && yarn pkg:build'
echo "Remotely building Tegh [DONE]"

cd ./snap

rm -rf ./node_modules
snapcraft clean
snapcraft clean tegh -s pull

sed -i -E "s/version:[^\n]+/version: $TEGH_VERSION/g" ./snapcraft.yaml
sed -i -E "s/run-on:[^\n]+/run-on: armhf/g" ./snapcraft.yaml

rsync -e "ssh -p $TEGH_ARMV7_PORT" --chown=$USER:$USER -a --include="*.node" --include="*/" --exclude="*" --prune-empty-dirs $TEGH_ARMV7_HOST:~/tegh/node_modules ./
rsync -e "ssh -p $TEGH_ARMV7_PORT" --chown=$USER:$USER -a $TEGH_ARMV7_HOST:~/tegh/snap/tegh ./

snapcraft

mv ./*.snap ../dist/armhf.snap

echo "\n\nBUILD COMPLETE (don't worry about the warnings and yellow text they are probably fine)"
