#!/bin/bash
set -euo pipefail

cd ./armv7
# # Pull the latest version of the image, in order to
# # populate the build cache:
podman pull arm32v7/ubuntu:18.04 || true
# podman pull teg-armv7:compile-stage || true
# podman pull teg-armv7:latest        || true

# # Build the compile stage:
# podman build --target compile-stage \
#        --cache-from=teg-armv7:compile-stage \
#        --tag teg-armv7:compile-stage .

# Build the runtime stage, using cached compile stage:
podman build \
       --cgroup-manager="cgroupfs" \
       --cache-from=teg-armv7:compile-stage \
       --cache-from=teg-armv7:latest \
       --tag teg-armv7:latest .

# # Push the new versions:
# podman push teg-armv7:compile-stage
# podman push teg-armv7:latest
