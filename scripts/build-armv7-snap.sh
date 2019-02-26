TEGH_VERSION=`node -e "console.log(require('./packages/tegh-core/package.json').version);"`;
echo "\e[32mSnapping Tegh $TEGH_VERSION for armv7:\e[0m Ignore the warnings and scary yellow text. This is not a pretty process.\n"
USER=`whoami`

echo "Remotely building Tegh"
ssh $RASPBERRY_PI cd tegh && yarn pkg:build
echo "Remotely building Tegh [DONE]"

cd ./snap

rm -f ./*.snap
rm -rf ./node_modules
rm -rf ./tegh
snapcraft clean
snapcraft clean tegh -s pull

sed -i -E "s/version:[^\n]+/version: $TEGH_VERSION/g" ./snapcraft.yaml
sed -i -E "s/run-on:[^\n]+/run-on: armhf/g" ./snapcraft.yaml

rsync --chown=$USER:$USER -a --include="*.node" --include="*/" --exclude="*" --prune-empty-dirs $RASPBERRY_PI:~/tegh/node_modules ./
rsync --chown=$USER:$USER -a $RASPBERRY_PI:~/tegh/snap/tegh ./
snapcraft &&\
echo "\n\nBUILD COMPLETE (don't worry about the warnings and yellow text they are probably fine)"
