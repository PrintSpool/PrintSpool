#!/bin/bash
set -e

mkdir -p ./dist
rm -f ./dist/*.snap

[ ! -d ./armhf/ephemeral-copy ] && git clone -l ./ ./armhf/ephemeral-copy

mkdir -p ./snap/teg-auth-bin/x64
mkdir -p ./snap/teg-auth-bin/armv7
mkdir -p ./snap/teg-marlin-bin/x64
mkdir -p ./snap/teg-marlin-bin/armv7

if [ -z "$SKIP_RUST" ]
then
  if [ -z "$SKIP_MARLIN" ]
  then
    echo "Building teg-marlin..."
    [ -z "$SKIP_X64" ] && yarn tegmarlin:build:x64
    [ -z "$SKIP_ARMV7" ] && yarn tegmarlin:build:armv7
    echo "Building teg-marlin... [DONE]"
  fi

  if [ -z "$SKIP_AUTH" ]
  then
    echo "Building teg-auth..."
    [ -z "$SKIP_X64" ] && yarn tegauth:build:x64
    [ -z "$SKIP_ARMV7" ] && yarn tegauth:build:armv7
    echo "Building teg-auth... [DONE]"
  fi
fi

if [ -z "$SKIP_PKG" ]
then
  if [ -z "$SKIP_X64" ]
  then
    echo "Building local (x64) pkg..."
    ./scripts/build-pkg.sh
    echo "Building local (x64) pkg... [DONE]"
  fi

  if [ -z "$SKIP_ARMV7" ]
  then
    echo "Building armhf pkg..."
    # ./armhf/build-image.sh
    podman run -v "$PWD":/usr/src/teg -w /usr/src/teg/ -it teg-armhf /bin/bash -c ./scripts/build-pkg-ephemeral.sh
    echo "Building armhf pkg... [DONE]"
  fi
else
  echo "\n\$SKIP_PKG: Reusing previous pkg builds. NodeJS changes will *not* be included in this build."
fi

TEG_VERSION=`node -e "console.log(require('./packages/teg-core/package.json').version);"`;

cd ./snap

sed -i -E "s/^version:[^\n]+/version: $TEG_VERSION/g" ./snapcraft.yaml

# snapcraft clean
# snapcraft clean teg

# snapcraft --debug
# [ -z "$SKIP_ARMV7" ] && snapcraft snap --debug --target-arch armhf
# [ -z "$SKIP_X64" ] && snapcraft snap --debug --target-arch amd64

snapcraft remote-build --launchpad-accept-public-upload

mv ./*.snap ../dist/
# mv ./armhf/ephemeral-copy/*.snap ../dist/
