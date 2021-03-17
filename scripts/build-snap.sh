#!/bin/bash
set -e

mkdir -p ./dist
rm -f ./dist/*.snap

if [ -z "$SKIP_RUST" ]
then

  cargo build --workspace --release
  if [ -z "$SKIP_X64" ]
  then
    echo "Building rust binaries for X64..."
    rm -rf ./snap/bin/x64
    mkdir -p ./snap/bin/x64

    cp -R ./crates/machine/migrations ./snap/bin/x64/migrations

    cargo build --workspace --release

    cp ./target/release/teg-invite ./snap/bin/x64/teg-invite
    cp ./target/release/teg-marlin ./snap/bin/x64/teg-marlin
    cp ./target/release/teg-server ./snap/bin/x64/teg-server
    cp ./target/release/teg-supervisor ./snap/bin/x64/teg-supervisor

    echo "Building rust binaries for X64... [DONE]"
  fi

  if [ -z "$SKIP_ARMV7" ]
  then
    echo "Building rust binaries for Arm..."
    rm -rf ./snap/bin/armv7
    mkdir -p ./snap/bin/armv7

    cp -R ./crates/machine/migrations ./snap/bin/armv7/migrations

    cargo build --workspace --release --target=armv7-unknown-linux-gnueabihf

    # cp ./target/release/teg-invite ./snap/bin/armv7/teg-invite
    # cp ./target/release/teg-marlin ./snap/bin/armv7/teg-marlin
    # cp ./target/release/teg-server ./snap/bin/armv7/teg-server
    # cp ./target/release/teg-supervisor ./snap/bin/armv7/teg-supervisor

    echo "Building rust binaries for Arm... [DONE]"
  fi
else
  echo "\n\$SKIP_RUST: Reusing previous rust builds. Rust changes will *not* be included in this build."
fi

# TEG_VERSION=`node -e "console.log(require('./lerna.json').version);"`;

cd ./snap

# sed -i -E "s/^version:[^\n]+/version: $TEG_VERSION/g" ./snapcraft.yaml

# if [ -z "$CLEAN_TEG_BUILD" ]
# then
snapcraft clean
# snapcraft clean tegh
# fi

# snapcraft --debug
snapcraft snap --debug
# [ -z "$SKIP_ARMV7" ] && snapcraft snap --debug --target-arch armhf
# [ -z "$SKIP_X64" ] && snapcraft snap --debug --target-arch amd64

# snapcraft remote-build --launchpad-accept-public-upload

mv ./*.snap ../dist/
