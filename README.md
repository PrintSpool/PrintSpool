# Print Spool

A bold new way to 3D print over WiFi.

Get started at [https://printspool.io]

**Warning:** Print Spool is in active development and not yet production-ready. It may have substantial bugs.

If you find any please me know in the issues! Even if it is a known issue an upvote for the bug helps me prioritize what to work on next.


## Dev Environment

### Dev Environment Setup

For completeness this documentation lists all the dependencies to get a development environment running on a fresh Ubuntu 18.04 install. You may opt to skip the dependencies you have installed already.

1. Install [nvm](https://github.com/creationix/nvm)
2. Install [Rust](https://rustup.rs/)
3. [OPTIONAL] Install the [mold linker](https://github.com/rui314/mold) for faster builds
3. `sudo apt update && sudo apt install build-essential clang libclang1 cmake pkg-config python tmux qemu qemu-user qemu-user-static binutils-arm-linux-gnueabihf gcc-arm-linux-gnueabihf fuse-overlayfs g++-arm-linux-gnueabihf libbsd-dev protobuf-compiler postgresql postgresql-contrib`
5. Allow serial port access via the dialout group and then restart your computer: `sudo gpasswd --add ${USER} dialout`
6. Increase the max_user_watches: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`
8. Set up Postgres for passwordless local development: https://gist.github.com/p1nox/4953113
7. Install cargo-watch, sqlx, node 10 and yarn with: `./scripts/bootstrap`


### Running the Development Servers

Disable any other copies of teg and run `./scripts/start-tmux`

It's recommended you do this in a dev environment with at least 16GB of ram.

`./scripts/start-tmux`:

- starts all the services required for a hot reloading development 3D print using your `/etc/teg-dev/` configs
- starts a hot reloading instance of the web ui

Once you have `start-tmux` running you can create an invite code to access your dev instance by running:

`cd ./crates/ && cargo run --bin teg-invite`


### Building Releases

Releases are built through Github Actions CI

To update the changelog and create a release tag run: `./scripts/release`

#### Test Releases

- Alternatively, you can compile release builds locally using `cargo build --release`
- To build a test release via CI first fork this repo and then push an annotated tag to your fork:

  `git tag -d tag-test; git tag -a tag-test -m "CI Testing / Do not Use" && git push fork -f tag-test`

### Developer Rapsberry Pi Setup

Note: Print Spool is in Limited Closed Beta testing at the moment. These instructions are for my own personal use and will very likely not work on your computer.

#### Part 1: Setting up a Rapsberry Pi

Note: Pi Bakery may be an easier alternative to the steps bellow Windows and Mac users. See: https://www.pibakery.org/

1. Use the [https://www.raspberrypi.org/downloads/](Raspberry Pi Imager) to install the latest Raspberry Pi OS
2. *Recommended* Generate a password hash (`openssl passwd -6`) and replace the pi's password in `/YOUR_SD_CARD/etc/shadow` on your sd card
3. *Optional, if using Wifi* Set up wifi: https://desertbot.io/blog/headless-raspberry-pi-3-bplus-ssh-wifi-setup
4. *Optional* Add a ssh file to the boot partition to enable SSH ( See: https://www.raspberrypi.org/documentation/remote-access/ssh/README.md )
5. *Optional* Set a host name: https://raspberrypi.stackexchange.com/a/44963

#### Part 2: Installing Print Spool
TODO: Print Spool no longer uses the Snapstore, update these docs.

1. Start your Raspbery Pi
2. On the Raspberry Pi (via SSH or with a monitor and keyboard) install Print Spool using:
  `bash <(curl -s https://raw.githubusercontent.com/tegapp/teg/develop/scripts/install)`

## Troubleshooting

### Enabling the RaspberryPi Camera

To enable the PiCam on the Raspberry Pi run: `sudo modprobe bcm2835-v4l2`

You should not need to do this for a USB webcam.

Source: https://www.raspberrypi.org/forums/viewtopic.php?t=62364

<!--
  TODO: I think the following information is out of date and no longer necessary to configure Print Spool:

  This will default the camera to 128x96px

  To increase the resolution run:

  `v4l2-ctl --set-fmt-video=width=1920,height=1088,pixelformat=4`

  ### Raspian

  Print Spool requires Raspbian Buster. To upgrade to Raspbian Buster see:

  https://www.raspberrypi.org/blog/buster-the-new-version-of-raspbian/
-->

### Known Issues

- The print button can take 40 seconds or more to start a print when teg is running in development. This is due to some optimizations Cargo and Rust disable in development that strongly effect the performance of Nom's parsers and async Streams. Running teg in release (eg. `cargo run --release`) solves this issue.
