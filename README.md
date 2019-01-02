[![NSP Status](https://nodesecurity.io/orgs/tegh/projects/24e090c8-8a9b-4827-a224-6e638b70df50/badge)](https://nodesecurity.io/orgs/tegh/projects/24e090c8-8a9b-4827-a224-6e638b70df50)

## The Tegh Project

Tegh is a work in progress Next Gen 3D Printer Host Server. Tegh aims to:
1. connect your 3D printer to the internet with any commodity USB Type C Android phone
2. control your 3D printer from anywhere with end-to-end encryption, WebRTC and live video streaming
3. streamline your 3D printing process with easy-to-use print queuing

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

<!-- TODO: rewrite outdated SystemD scripts and update docs.
## Installing the development server SystemD Unit File

As a temporary provision until a build script is ready for Tegh the server can be installed with systemd via the following steps:

1. Run:
  ```
    sudo ln -s `pwd`/packages/tegh-host-posix/scripts/tegh-host-posix /usr/sbin/tegh-host-posix
    sudo cp `pwd`/packages/tegh-host-posix/scripts/tegh-host-posix.service /etc/systemd/system/
  ```
2. Fill in your username: `sudo vim /etc/systemd/system/tegh-host-posix.service`
3. Run:
  ```
    systemctl daemon-reload
    systemctl enable tegh-host-posix
    systemctl start tegh-host-posix
  ```
4. Unplug and replug the 3D printer

Tegh's stderr log is accessible via journalctl:

`journalctl -u tegh-host-posix.service --follow` -->

## Building the executable

Running `yarn build-x64` or `yarn build-armv7` will probably cause you a few errors. Here's how to fix them:

### Native Modules Error
Problem: `if(!found) throw new Error('Unable to find native module')`

Solution: Because of https://github.com/node-webrtc/node-webrtc/issues/404 we need to manually replace the contents of `node_modules/wrtc/lib/binding.js` with:

`module.exports = require('../build/Release/wrtc.node');`

See also https://github.com/node-webrtc/node-webrtc/pull/470

### No-bytcode breaks final executable

Problem: `Error! --no-bytecode and no source breaks final executable`

Solution:
1. `vim node_modules/pkg/lib-es5/walker.js`
2. modify `isPublic(config)` to always return true

See also https://github.com/zeit/pkg/issues/145
