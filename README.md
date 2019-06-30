<div align="center">
<img src="./packages/tegh-web-ui/images/TEGH_Logo.svg" alt="Teg" width="200"/>
</div>

## Teg

A bold new way to 3D print over WiFi.

## Getting Started

1. Download [Beaker Browser](https://beakerbrowser.com)
3. Open Beaker and follow the instructions at [dat://tegh.io](dat://tegh.io)

## Hacking

### Dev Installation

1. Install [nvm](https://github.com/creationix/nvm)
2. Bootstrap the dev environment with tegh, node 10 and yarn:
`nvm use && npm i -g yarn && yarn bootstrap`

<!-- ### [Optional] Emulating a Raspberry Pi

1. Install [qemu](https://www.qemu.org/download/): `sudo apt-get install qemu-system qemu-system-arm qemu-kvm libvirt-daemon bridge-utils virt-manager`
2. Download the [ARMv7 Ubuntu 18.10 image](https://cloud-images.ubuntu.com/releases/18.10/release/ubuntu-18.10-server-cloudimg-armhf.img) -->

### Running the Dev Host + Web UI

Disable any other copies of tegh and run `yarn start`

This:
* starts a hot reloading development server using your `~/.tegh/config.json`.
* compiles the tegh-web-ui and watches for changes. To preview the UI open `packages/tegh-web-ui/dist` in Beaker's Library.
* echos an invite code to the command line if you haven't connected already.

### Running the test suite

Run `yarn test`
