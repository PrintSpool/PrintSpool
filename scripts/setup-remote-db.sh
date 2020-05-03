#!/bin/bash
set -e

echo "This script will only start the port forwarding. You need to do the rest by hand"

# Do this in the first terminal (this is what this script does)
ssh -N  -L 127.0.0.1:5431:localhost:5432 $TEG_ARMV7_HOST

# Do this in the second terminal
DATABASE_URL=postgres://postgres@localhost:5431/teg sqlx db create
DATABASE_URL=postgres://postgres@localhost:5431/teg sqlx migrate run
