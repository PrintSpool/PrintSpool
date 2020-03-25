#!/bin/sh
tmux new-session -d 'yarn start:host'
tmux split-window -v 'yarn start:web-ui'
tmux new-window 'mutt'
tmux -2 attach-session -d
