<div align="center">
<img src="./packages/teg-web-ui/src/onboarding/landingPage/tegLogo.svg" alt="Teg" width="200"/>
</div>

## Teg

A bold new way to 3D print over WiFi.

Get started at [https://tegapp.io]

Note: Teg is an early-access alpha in active development. Please be aware that it may have substantial bugs.

Last but not least if you find any please me know in the issues! Even if it is a known issue an upvote for the bug helps me prioritize what to work on next.


## Dev Environment

### Dev Environment Setup

For completeness this documentation lists all the dependencies to get a development environment running on a fresh Ubuntu 18.04 install. You may opt to skip the dependencies you have installed already.

1. Install [nvm](https://github.com/creationix/nvm)
2. Install [Rust](https://rustup.rs/)
3. `sudo apt update && sudo apt install build-essential pkg-config python tmux qemu qemu-user qemu-user-static binutils-arm-linux-gnueabihf gcc-arm-linux-gnueabihf fuse-overlayfs`
<!-- Removed until we need PG again: libssl-dev postgresql libpq-dev -->
4. Enable Passwordless local logins in Postgres: https://gist.github.com/p1nox/4953113
5. Allow serial port access via the dialout group and then log out and back in: `sudo gpasswd --add ${USER} dialout`
6. Increase the max_user_watches: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`
7. Bootstrap the dev environment with teg, node 10 and yarn:
`nvm use && npm i -g yarn && yarn bootstrap`


### Running the Dev Host + Web UI

Disable any other copies of teg and run `yarn start`

It's recommended you do this in a dev environment with at least 16GB of ram.

This:
* starts all the services required for a hot reloading development 3D print using your `/etc/teg/` configs
* starts a hot reloading instance of the web ui
* echos an invite code to the command line if you haven't connected already.


## Building Releases

### Build Environment Setup

Note: These dependencies are only for building snaps - they are not needed for most development.

1. Install Podman: https://podman.io/getting-started/installation.html
2. `sudo snap install snapcraft --classic`
3. `pushd . && cd ./packages/teg-auth/ && rustup target add armv7-unknown-linux-gnueabihf && popd`
4. Build the docker image: `./armv7/build-image.sh`


### Building the snap

`yarn snap:build`


<!-- ### Running the test suite

Run `yarn test`
 -->

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

### Restoring from Backup

Teg takes weekly backups so if your database becomes corrupted you should be able to restore from an automatic backup.

To learn how to restore from backup run: `tegh.restore-backup --help`

Backups are stored in `/var/snap/tegh/current/backups`

<!-- 
  TODO: I think the following information is out of date and no longer necessary to configure Teg:

  This will default the camera to 128x96px

  To increase the resolution run:

  `v4l2-ctl --set-fmt-video=width=1920,height=1088,pixelformat=4`

  ### Raspian

  Teg requires Raspbian Buster. To upgrade to Raspbian Buster see:

  https://www.raspberrypi.org/blog/buster-the-new-version-of-raspbian/
-->
