FROM arm32v7/ubuntu:16.04 as compile-stage

# Grab dependencies
RUN apt-get update
RUN apt-get dist-upgrade --yes
RUN apt-get install --yes \
      curl \
      jq \
      squashfs-tools

# Grab the core snap (for backwards compatibility) from the stable channel and
# unpack it in the proper place.
RUN curl -L $(curl -H 'X-Ubuntu-Series: 16' 'https://api.snapcraft.io/api/v1/snaps/details/core' | jq '.download_url' -r) --output core.snap
RUN mkdir -p /snap/core
RUN unsquashfs -d /snap/core/current core.snap

# Grab the core18 snap (which snapcraft uses as a base) from the stable channel
# and unpack it in the proper place.
RUN curl -L $(curl -H 'X-Ubuntu-Series: 16' 'https://api.snapcraft.io/api/v1/snaps/details/core18' | jq '.download_url' -r) --output core18.snap
RUN mkdir -p /snap/core18
RUN unsquashfs -d /snap/core18/current core18.snap

# Grab the core20 snap from the stable channel
# and unpack it in the proper place.
RUN curl -L $(curl -H 'X-Ubuntu-Series: 16' 'https://api.snapcraft.io/api/v1/snaps/details/core20' | jq '.download_url' -r) --output core20.snap
RUN mkdir -p /snap/core20
RUN unsquashfs -d /snap/core20/current core20.snap

# Grab the snapcraft snap from the stable channel and unpack it in the proper
# place.
RUN curl -L $(curl -H 'X-Ubuntu-Series: 16' 'https://api.snapcraft.io/api/v1/snaps/details/snapcraft?channel=stable' | jq '.download_url' -r) --output snapcraft.snap
RUN mkdir -p /snap/snapcraft
RUN unsquashfs -d /snap/snapcraft/current snapcraft.snap

# Create a snapcraft runner (TODO: move version detection to the core of
# snapcraft).
RUN mkdir -p /snap/bin
RUN echo "#!/bin/sh" > /snap/bin/snapcraft
RUN snap_version="$(awk '/^version:/{print $2}' /snap/snapcraft/current/meta/snap.yaml)" && echo "export SNAP_VERSION=\"$snap_version\"" >> /snap/bin/snapcraft
RUN echo 'exec "$SNAP/usr/bin/python3" "$SNAP/bin/snapcraft" "$@"' >> /snap/bin/snapcraft
RUN chmod +x /snap/bin/snapcraft

# ----------------------------------------------------------------------------------------------------------
# Runtime
# ----------------------------------------------------------------------------------------------------------

# # Multi-stage build, only need the snaps from the compile-stage. Copy them one at a
# # time so they can be cached.
FROM arm32v7/ubuntu:16.04 as runtime-image
COPY --from=compile-stage /snap/core /snap/core
COPY --from=compile-stage /snap/core18 /snap/core18
COPY --from=compile-stage /snap/core20 /snap/core20
COPY --from=compile-stage /snap/snapcraft /snap/snapcraft
COPY --from=compile-stage /snap/bin/snapcraft /snap/bin/snapcraft

# NVM
# ----------------------------------------------------------------------------------------------------------

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Set debconf to run non-interactively
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Install base dependencies
RUN apt-get update && apt-get install -y -q --no-install-recommends \
        nodejs \
        apt-transport-https \
        build-essential \
        ca-certificates \
        curl \
        git \
        libssl-dev \
        wget \
        sudo \
        locales \
    && locale-gen en_US.UTF-8 \
    && rm -rf /var/lib/apt/lists/*

# Install nvm with node and npm
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.35.3/install.sh | bash \
    && . $HOME/.nvm/nvm.sh \
    && nvm install  12.11.1
    # && nvm use --delete-prefix v12.11.1
    # && nvm use --delete-prefix v12.11.1 \
    # && nvm alias default 12.11.1 \
    # && npm i -g yarn

# Set the proper environment.
ENV NVM_DIR $HOME/.nvm
ENV NODE_PATH $NVM_DIR/v12.11.1/lib/node_modules

ENV LANG="en_US.UTF-8"
ENV LANGUAGE="en_US:en"
ENV LC_ALL="en_US.UTF-8"

ENV SNAP="/snap/snapcraft/current"
ENV SNAP_NAME="snapcraft"
ENV SNAP_ARCH="armhf"

ENV PATH="/snap/bin:$NVM_DIR/v12.11.1/bin:$PATH"

# Rust
# ----------------------------------------------------------------------------------------------------------
# RUN apt-get install -y curl

# RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# RUN apt-get install -y vim snapd squashfuse fuse build-essential
# RUN systemctl enable snapd

# ENV container docker
# ENV PATH /snap/bin:$HOME/.cargo/bin:$PATH
# # ADD snap /usr/local/bin/snap

# # STOPSIGNAL SIGRTMIN+3
# # CMD [ "/sbin/init" ]

# CMD ["/bin/bash"]
