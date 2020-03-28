#!/bin/sh
tmux new-session -d 'bash --rcfile <(echo ". ~/.bashrc; yarn start:host")'
tmux split-window -h 'bash --rcfile <(echo ". ~/.bashrc; cd ./packages/teg-marlin/ && cargo run")'
tmux split-window -v 'bash --rcfile <(echo ". ~/.bashrc; yarn start:web-ui")'
tmux new-window 'mutt'
tmux -2 attach-session -d
