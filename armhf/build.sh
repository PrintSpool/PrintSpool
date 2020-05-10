#!/bin/bash
set -euo pipefail
# # Pull the latest version of the image, in order to
# # populate the build cache:
# podman pull teg-armhf:compile-stage || true
# podman pull teg-armhf:latest        || true

# # Build the compile stage:
# podman build --target compile-stage \
#        --storage-driver=overlay \
#        --cache-from=teg-armhf:compile-stage \
#        --tag teg-armhf:compile-stage .

# Build the runtime stage, using cached compile stage:
podman build --target runtime-image \
       --storage-driver=overlay \
       --cache-from=teg-armhf:compile-stage \
       --cache-from=teg-armhf:latest \
       --tag teg-armhf:latest .

# Push the new versions:
podman push teg-armhf:compile-stage
podman push teg-armhf:latest
