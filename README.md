[![NSP Status](https://nodesecurity.io/orgs/tegh/projects/24e090c8-8a9b-4827-a224-6e638b70df50/badge)](https://nodesecurity.io/orgs/tegh/projects/24e090c8-8a9b-4827-a224-6e638b70df50)

## Installation

Run `yarn`

**Prerequisites:** node and yarn (`npm i -g yarn`)

## Running the Production Server

Run `yarn start`

**Note:** This is a temporary stop-gap solution. Eventually the plan is to start
Tegh via SystemD.

## Hacking

### Running the Dev Server

Run `yarn dev`

* starts a development server connected to a simulated serial port
* starts the tegh-web-ui dev server
* information on how to connect to the servers is echo'd to the command line

### Running the test suite

Run `yarn test`

## Installing the development server SystemD Unit File

As a temporary provision until a build script is ready for Tegh the server can be installed with systemd via the following steps:

1. Run:
  ```
    sudo ln -s `pwd`/tegh/packages/tegh-server/scripts/tegh-server /usr/sbin/tegh-server
    sudo cp `pwd`/scripts/tegh-server.service /etc/systemd/system/
  ```
2. Fill in your username and group: `sudo vim /etc/systemd/system/tegh-server.service`
3. Run:
  ```
    systemctl daemon-reload
    systemctl enable tegh-server
  ```
4. Unplug and replug the 3D printer
