TEGH_VERSION=`node -e "console.log(require('./packages/tegh-core/package.json').version);"`;
echo "\e[32mSnapping Tegh x64 $TEGH_VERSION:\e[0m Ignore the warnings and scary yellow text. This is not a pretty process.\n"

rm -f ./snap/*.snap
rm -rf ./snap/node_modules
rm -rf ./snap/tegh
cd ./snap
sed -i -E "s/version:[^\n]+/version: $TEGH_VERSION/g" ./snapcraft.yaml
snapcraft clean
snapcraft clean tegh -s pull
cd ../

yarn build-dev &&\
rsync -a --include="*.node" --include="*/" --exclude="*" --prune-empty-dirs ./node_modules ./snap/ &&
cd ../../snap/ &&\
snapcraft &&\
echo "\n\nBUILD COMPLETE (don't worry about the warnings and yellow text they are probably fine)"
