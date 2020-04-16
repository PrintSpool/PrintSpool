#!/bin/bash
set -e

cargo install --git https://github.com/launchbadge/sqlx.git cargo-sqlx
cargo install cargo-watch
# cargo install cargo-watch cargo-sqlx

cd ./packages/teg-auth/
sqlx migrate run

yarn
yarn make-dirs

cd ../teg-web-ui/
yarn

cd ../teg-host-posix/
yarn create-config
