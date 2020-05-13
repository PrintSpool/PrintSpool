<div align="center">
<img src="./packages/teg-web-ui/src/onboarding/landingPage/tegLogo.svg" alt="Teg" width="200"/>
</div>

## Teg

A bold new way to 3D print over WiFi.

Get started at [https://tegapp.io]

Note: Teg is an early-access alpha in active development. Please be aware that it may have substantial bugs.

Last but not least if you find any please me know in the issues! Even if it is a known issue an upvote for the bug helps me prioritize what to work on next.

## Dev Environment

### Environment Setup

1. Install [nvm](https://github.com/creationix/nvm)
2. Install [Rust](https://rustup.rs/)
3. `sudo apt update && sudo apt install libssl-dev postgresql libpq-dev tmux qemu qemu-user qemu-user-static binutils-arm-linux-gnueabihf gcc-arm-linux-gnueabihf fuse-overlayfs`
4. Enable Passwordless local logins in Postgres: https://gist.github.com/p1nox/4953113
5. Allow serial port access via the dialout group and then log out and back in: `sudo gpasswd --add ${USER} dialout`
6. Create an empty `teg-auth` database using psql
7. Bootstrap the dev environment with teg, node 10 and yarn:
`nvm use && npm i -g yarn && yarn bootstrap`

## Compiling Releases

### Environment Setup

Note: These dependencies are only for building snaps - they are not needed for most development.

1. Install Podman: https://podman.io/getting-started/installation.html
2. `cargo install cross`
3. Build the docker image: `./armv7/build-image.sh`
4. `podman run -v "$PWD":/usr/src/teg -w /usr/src/teg/ -it teg-armv7 /bin/bash -c ./scripts/build-pkg-ephemeral.sh`

### Building the snap

`yarn snap:build`

## Running the Dev Host + Web UI

Disable any other copies of teg and run `yarn start`

This:
* starts a hot reloading development server using your `~/.teg/config.json`.
* compiles the teg-web-ui and watches for changes. To preview the UI open `packages/teg-web-ui/dist` in Beaker's Library.
* echos an invite code to the command line if you haven't connected already.

### Running the test suite

Run `yarn test`


### Enabling V4L2 on the Offial RaspberryPi Camera

See: https://www.raspberrypi.org/forums/viewtopic.php?t=62364

TL;DR: run: `sudo modprobe bcm2835-v4l2`

This will default the camera to 128x96px

To increase the resolution run:

`v4l2-ctl --set-fmt-video=width=1920,height=1088,pixelformat=4`

### Raspian

Teg requires Raspbian Buster. To upgrade to Raspbian Buster see:

https://www.raspberrypi.org/blog/buster-the-new-version-of-raspbian/
