#!/bin/bash
set -e

sudo apt install g++-arm-linux-gnueabihf

rustup target add armv7-unknown-linux-gnueabihf

# cargo install --git https://github.com/launchbadge/sqlx.git cargo-sqlx
cargo install cargo-watch
# cargo install cargo-watch cargo-sqlx

# cd ./packages/teg-auth/
# sqlx db create
# sqlx migrate run

# yarn
# yarn make-dirs

pushd
cd ./packages/teg-web-ui/
yarn
popd
