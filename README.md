[![NSP Status](https://nodesecurity.io/orgs/tegh/projects/24e090c8-8a9b-4827-a224-6e638b70df50/badge)](https://nodesecurity.io/orgs/tegh/projects/24e090c8-8a9b-4827-a224-6e638b70df50)

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-white.svg)](https://snapcraft.io/tegh)

## Tegh

Tegh is an experimental 3D printing software designed from the ground up to streamline your 3D printing experience. Tegh features a print queue that enables users to easily queue up prints without managing complicated file systems. To manage prints remotely Tegh is built on top of encrypted, distributed web technologies so you can use your 3D printer from anywhere in the world just as easily as from your home. With Tegh you can worry less and create more.

## Installation

with Node v10.12.0 run `yarn bootstrap`

**Prerequisites:** node v10.12.0 (we recommend using nvm) and yarn (`npm i -g yarn`)

## Hacking

The yarn scripts bellow should be run from the root directory of this repo.

### Running the Dev Host + Web UI

Run `yarn start`

**Note:** This is the only way to run tegh atm. It is a temporary stop-gap solution. Eventually the plan is to start Tegh via SystemD or inside of an Android App but neither of those are done yet.

* starts a development server connected to a simulated serial port
* starts the tegh-web-ui dev server
* information on how to connect to the servers is echo'd to the command line

### Running the test suite

Run `yarn test`

## Debugging the snap

When running tegh from the Snap store logs are available by running:

`journalctl -u snap.tegh.tegh.service`

## Installing the development server SystemD Unit File

As a temporary provision until a build script is available for Tegh, the server can be installed with systemd via the following steps:

1. Symlink the Tegh server:
  ```
    sudo ln --symbolic --target-directory=/usr/local/bin `pwd`/packages/tegh-host-posix/scripts/tegh-server
  ```
2. Link, enable, and start the Tegh server:
  ```
    systemctl --user link `pwd`/packages/tegh-host-posix/scripts/tegh-server.service
    systemctl --user enable --now tegh-server.service
  ```
4. Unplug and replug the 3D printer

Tegh's stderr log is accessible via journalctl:

`journalctl --user --unit=tegh-server.service`
