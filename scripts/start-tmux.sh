#!/bin/sh
tmux new-session -d '$SHELL --rcfile <(echo ". ~/.bashrc; cd ./packages/teg-host-posix/ && history -s \"yarn dev\" && yarn dev")'
tmux split-window -v '$SHELL --rcfile <(echo ". ~/.bashrc; cd ./packages/teg-auth/ && history -s \"RUST_ENV=development cargo watch -s \\\"cargo run && touch ./Cargo.toml\\\"\" && RUST_ENV=development cargo watch -s \"cargo run && touch ./Cargo.toml\"")'
tmux split-window -v '$SHELL --rcfile <(echo ". ~/.bashrc; cd ./packages/teg-marlin/ && history -s \"RUST_ENV=development cargo watch -s \\\"cargo run && touch ./Cargo.toml\\\"\" && RUST_ENV=development cargo watch -s \"cargo run && touch ./Cargo.toml\"")'
tmux split-window -h '$SHELL --rcfile <(echo ". ~/.bashrc; cd ./packages/teg-web-ui/ && history -s \"yarn start\" && yarn start")'
tmux new-window 'mutt'
tmux -2 attach-session -d
