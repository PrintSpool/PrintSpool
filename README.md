<div align="center">
<img src="./packages/teg-web-ui/src/onboarding/landingPage/tegLogo.svg" alt="Teg" width="200"/>
</div>

## Teg

A bold new way to 3D print over WiFi.

## Getting Started

1. Download [Beaker Browser](https://beakerbrowser.com)
3. Open Beaker and follow the instructions at [dat://tegapp.io](dat://tegapp.io)

## Hacking

### Dev Installation

1. Install [nvm](https://github.com/creationix/nvm)
2. Bootstrap the dev environment with teg, node 10 and yarn:
`nvm use && npm i -g yarn && yarn bootstrap`

<!-- ### [Optional] Emulating a Raspberry Pi

1. Install [qemu](https://www.qemu.org/download/): `sudo apt-get install qemu-system qemu-system-arm qemu-kvm libvirt-daemon bridge-utils virt-manager`
2. Download the [ARMv7 Ubuntu 18.10 image](https://cloud-images.ubuntu.com/releases/18.10/release/ubuntu-18.10-server-cloudimg-armhf.img) -->

### Running the Dev Host + Web UI

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