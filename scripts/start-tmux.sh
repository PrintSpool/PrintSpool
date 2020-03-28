#!/bin/sh
tmux new-session -d '$SHELL --rcfile <(echo ". ~/.bashrc; cd ./packages/teg-host-posix/ && history -s \"yarn dev\" && yarn dev")'
tmux split-window -v '$SHELL --rcfile <(echo ". ~/.bashrc; cd ./packages/teg-auth/ && history -s \"cargo run\" && RUST_ENV=development cargo run")'
tmux split-window -v '$SHELL --rcfile <(echo ". ~/.bashrc; cd ./packages/teg-marlin/ && history -s \"cargo run\" && RUST_ENV=development cargo run")'
tmux split-window -h '$SHELL --rcfile <(echo ". ~/.bashrc; history -s \"yarn start:web-ui\" && yarn start:web-ui")'
tmux new-window 'mutt'
tmux -2 attach-session -d
