#!/bin/bash
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

cd ./armv7/ephemeral-copy/

git add -A
git reset --hard HEAD
git pull

# rsync -r --exclude='/.git'  --exclude='/node_modules' --exclude='/**/node_modules' --filter=':- .gitignore' ../../ ./

nvm use

yarn
./scripts/build-pkg.sh

rsync -r ./snap/teg-server-bin/armv7/ ../../snap/teg-server-bin/armv7
