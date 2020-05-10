#!/bin/bash
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

cd ./armhf/ephemeral-copy/

git pull

npm i -g yarn
yarn
./scripts/build-snap-worker.sh

