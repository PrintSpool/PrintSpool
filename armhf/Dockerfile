FROM arm32v7/ubuntu:18.04 as compile-stage

# Grab dependencies
RUN apt-get update
RUN apt-get dist-upgrade --yes

# Install base dependencies
RUN apt-get install --yes --no-install-recommends \
        nodejs \
        python \
        rsync \
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

# NVM
# ----------------------------------------------------------------------------------------------------------

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Set debconf to run non-interactively
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# Install nvm with node and npm
RUN curl https://raw.githubusercontent.com/creationix/nvm/v0.35.3/install.sh | bash \
    && . $HOME/.nvm/nvm.sh \
    && nvm install  12.11.1 \
    # && nvm use --delete-prefix v12.11.1
    # && nvm use --delete-prefix v12.11.1 \
    # && nvm alias default 12.11.1 \
    && ~/.nvm/versions/node/v12.11.1/bin/npm i -g yarn

# Set the proper environment.
ENV NVM_DIR $HOME/.nvm
ENV NODE_PATH $NVM_DIR/v12.11.1/lib/node_modules

ENV LANG="en_US.UTF-8"
ENV LANGUAGE="en_US:en"
ENV LC_ALL="en_US.UTF-8"

ENV SNAP="/snap/snapcraft/current"
ENV SNAP_NAME="snapcraft"
ENV SNAP_ARCH="armhf"

ENV PATH="/snap/bin:$NVM_DIR/versions/node/v12.11.1/bin:$PATH"

CMD ["/bin/bash"]

