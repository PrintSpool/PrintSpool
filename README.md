<div align="center">
<img src="./packages/teg-web-ui/src/onboarding/landingPage/tegLogo.svg" alt="Teg" width="200"/>
</div>

## Teg

A bold new way to 3D print over WiFi.

Get started at [https://tegapp.io]

**Warning:** Teg is in active development and not yet production-ready. It may have substantial bugs.

If you find any please me know in the issues! Even if it is a known issue an upvote for the bug helps me prioritize what to work on next.


## Dev Environment

### Dev Environment Setup

For completeness this documentation lists all the dependencies to get a development environment running on a fresh Ubuntu 18.04 install. You may opt to skip the dependencies you have installed already.

1. Install [nvm](https://github.com/creationix/nvm)
2. Install [Rust](https://rustup.rs/)
3. `sudo apt update && sudo apt install build-essential clang libclang1 cmake pkg-config python tmux qemu qemu-user qemu-user-static binutils-arm-linux-gnueabihf gcc-arm-linux-gnueabihf fuse-overlayfs g++-arm-linux-gnueabihf libbsd-dev protobuf-compiler postgresql postgresql-contrib`
5. Allow serial port access via the dialout group and then restart your computer: `sudo gpasswd --add ${USER} dialout`
6. Increase the max_user_watches: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`
8. Set up Postgres for passwordless local development: https://gist.github.com/p1nox/4953113
7. Install cargo-watch, sqlx, node 10 and yarn with: `./scripts/bootstrap`


### Running the Development Servers

Disable any other copies of teg and run `./scripts/start-tmux`

It's recommended you do this in a dev environment with at least 16GB of ram.

start-tmux:

- starts all the services required for a hot reloading development 3D print using your `/etc/teg/` configs
- starts a hot reloading instance of the web ui

Once you have `start-tmux` running you can create an invite code to access your dev instance by running:

`cd ./crates/ && cargo run --bin teg-invite`


## Building Releases

### Build Environment Setup

Note: These dependencies are only for building snaps - they are not needed for most development.

<!--
Note: These instructions may not be necessary any longer. If you can build for armhf without doing
the following please remove the following:

First setup armhf packages in ubuntu. See:
- https://stackoverflow.com/a/39316855
- https://wiki.debian.org/Multiarch/HOWTO

Essentially setting up armhf packages boils down to adding the following to `/etc/apt/sources.list`:
```
  deb [arch=armhf] http://bg.ports.ubuntu.com/ focal main restricted
  deb [arch=armhf] http://bg.ports.ubuntu.com/ focal-updates main restricted
```

And then running `sudo apt-get update && sudo dpkg --add-architecture armhf && sudo apt-get install libbsd-dev:armhf`

Once you have armhf set up then you can install the rest of the dependencies: -->

1. Install Podman: https://podman.io/getting-started/installation.html
2. `sudo snap install snapcraft --classic`


### Building the snap

- **Build:** `./scripts/build`
- **Build and Install Locally:** `./scripts/build-and-install`
- **Build and Publish to the Snap Store:** `./scripts/release`

### Developer Rapsberry Pi Setup

Note: Teg is in Limited Closed Beta testing at the moment. These instructions are for my own personal use and will very likely not work on your computer.

#### Part 1: Setting up a Rapsberry Pi

Note: Pi Bakery may be an easier alternative to the steps bellow Windows and Mac users. See: https://www.pibakery.org/

1. Use the [https://www.raspberrypi.org/downloads/](Raspberry Pi Imager) to install the latest Raspberry Pi OS
2. *Recommended* Generate a password hash (`openssl passwd -6`) and replace the pi's password in `/YOUR_SD_CARD/etc/shadow` on your sd card
3. *Optional, if using Wifi* Set up wifi: https://desertbot.io/blog/headless-raspberry-pi-3-bplus-ssh-wifi-setup
4. *Optional* Add a ssh file to the boot partition to enable SSH ( See: https://www.raspberrypi.org/documentation/remote-access/ssh/README.md )
5. *Optional* Set a host name: https://raspberrypi.stackexchange.com/a/44963

#### Part 2: Installing Teg

1. Start your Raspbery Pi
2. On the Raspberry Pi (via SSH or with a monitor and keyboard) install Teg from the snap store using: `sudo apt update && sudo apt install -y snapd && sudo snap install tegh --devmode`
<!-- 3. Generate an invite code using: `tegh.add-invite` -->

## Troubleshooting

### Enabling the RaspberryPi Camera

To enable the PiCam on the Raspberry Pi run: `sudo modprobe bcm2835-v4l2`

You should not need to do this for a USB webcam.

Source: https://www.raspberrypi.org/forums/viewtopic.php?t=62364

<!--
  TODO: I think the following information is out of date and no longer necessary to configure Teg:

  This will default the camera to 128x96px

  To increase the resolution run:

  `v4l2-ctl --set-fmt-video=width=1920,height=1088,pixelformat=4`

  ### Raspian

  Teg requires Raspbian Buster. To upgrade to Raspbian Buster see:

  https://www.raspberrypi.org/blog/buster-the-new-version-of-raspbian/
-->

### Known Issues

- The print button can take 40 seconds or more to start a print when teg is running in development. This is due to some optimizations Cargo and Rust disable in development that strongly effect the performance of Nom's parsers and async Streams. Running teg in release (eg. `cargo run --release`) solves this issue.
