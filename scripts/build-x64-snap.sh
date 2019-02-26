TEGH_VERSION=`node -e "console.log(require('./packages/tegh-core/package.json').version);"`;
echo "\e[32mSnapping Tegh $TEGH_VERSION for x64:\e[0m Ignore the warnings and scary yellow text. This is not a pretty process.\n"

cd ./snap

rm -f ./*.snap
rm -rf ./node_modules
rm -rf ./tegh
snapcraft clean
snapcraft clean tegh -s pull

sed -i -E "s/version:[^\n]+/version: $TEGH_VERSION/g" ./snapcraft.yaml
sed -i -E "s/run-on:[^\n]+/run-on: amd64/g" ./snapcraft.yaml

cd ../

yarn build-dev &&\
rsync -a --include="*.node" --include="*/" --exclude="*" --prune-empty-dirs ./node_modules ./snap/ &&
cd ../../snap/ &&\
snapcraft &&\
echo "\n\nBUILD COMPLETE (don't worry about the warnings and yellow text they are probably fine)"
