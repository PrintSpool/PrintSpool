#!/bin/bash
set -e

mkdir -p ./dist
rm -f ./dist/*.snap

[ ! -d ./armhf/ephemeral-copy ] && git clone -l ./ ./armhf/ephemeral-copy


if test -z "$SKIP_MARLIN"
then
  echo "Building teg-marlin..."
  [ -z "$SKIP_X64" ] && yarn tegmarlin:build:x64
  [ -z "$SKIP_ARMV7" ] && yarn tegmarlin:build:armv7
  echo "Building teg-marlin... [DONE]"
fi

if test -z "$SKIP_AUTH"
then
  echo "Building teg-auth..."
  [ -z "$SKIP_X64" ] && yarn tegauth:build:x64
  [ -z "$SKIP_ARMV7" ] && yarn tegauth:build:armv7
  echo "Building teg-auth... [DONE]"
fi

if test -z "$SKIP_X64"
then
  echo "Building local (x64) snap..."
  ./build-snap-worker.sh
  echo "Building local (x64) snap... [DONE]"
fi

if test -z "$SKIP_ARMV7"
then
  echo "Building armhf snap..."
  # ./armhf/build-image.sh
  podman run -v "$PWD":/usr/src/teg -w /usr/src/teg/ -it teg-armhf /bin/bash -c ./scripts/build-snap-worker-ephemeral.sh
  echo "Building armhf snap... [DONE]"
fi

# snapcraft remote-build --launchpad-accept-public-upload

mv ./*.snap ../dist/
mv ./armhf/ephemeral-copy/*.snap ../dist/
