#!/bin/bash
set -e

mkdir -p ./dist
rm -f ./dist/*.snap

if [ ! -d ./armhf/ephemeral-copy ] ; then
  git clone -l ./ ./armhf/ephemeral-copy
fi


# echo "\nBuilding teg-marlin...\n\n"
# if test -z "$SKIP_X64"
# then
#   yarn tegmarlin:build:x64
# fi
# if test -z "$SKIP_ARMV7"
# then
#   yarn tegmarlin:build:armv7
# fi
# echo "\n\nBuilding teg-marlin... [DONE]\n"


# echo "\nBuilding teg-auth...\n\n"
# if test -z "$SKIP_X64"
# then
#   yarn tegauth:build:x64
# fi
# if test -z "$SKIP_ARMV7"
# then
#   yarn tegauth:build:armv7
# fi
# echo "\n\nBuilding teg-auth... [DONE]\n"


# if test -z "$SKIP_X64"
# then
#   echo "\n Building local (x64) snap...\n\n"
#   ./build-snap-worker.sh
#   echo "\n Building local (x64) snap... [DONE]\n\n"
# fi

if test -z "$SKIP_ARMV7"
then
  echo "\n Building armhf snap...\n\n"
  # ./armhf/build-image.sh
  podman run -v "$PWD":/usr/src/teg -w /usr/src/teg/ -it teg-armhf /bin/bash -c ./scripts/build-snap-worker-ephemeral.sh
  echo "\n Building armhf snap... [DONE]\n\n"
fi

# snapcraft remote-build --launchpad-accept-public-upload

mv ./*.snap ../dist/
mv ./armhf/ephemeral-copy/*.snap ../dist/
