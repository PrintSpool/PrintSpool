# construct-daemon

A daemon that detects RepRap-like 3D printer (ex. Ultimakers or anything with Marlin firmware) and serves access to them on the local network via the construct protocol.

Why
====

Because I was tired of not being able to use my laptop while my 3D printer was printing. And having two printers was an even bigger problem.

How to try it out
==================

1. Install construct-daemon on your printer's computer/raspberry pi/old laptop (see Install)
2. Install [tegh][1] on your laptop (this will allow you to remotely control your printer)
3. Open the command line and type `tegh [ENTER]`.
4. Select your printer and start controlling your printer for fun an profit.


[1]: https://github.com/D1plo1d/tegh

Install
========

**Note:** construct-daemon is currently unstable. There has not been a stable release yet so there are not packages for distros that don't support git-based unstable releases.

### Arch

`yaourt -S construct-daemon-git`

### OSX / Non-Arch Linux Distros

1. Install an up to date copy of nodejs and npm
2. **Linux Only:** Install avahi and it's bonjour compatibility layer
3. `git clone https://github.com/D1plo1d/construct-daemon.git&& cd construct-daemon; npm install`
4. **Linux Only:** If you have systemd then you can set construct-daemon to load on startup by running  `sudo cp construct-daemon.service /etc/systemd/system/construct-daemon.service && sudo systemctl enable construct-daemon.service`

Upstart and initd are not yet supported so if you do not have systemd (for example on Ubuntu or OSX) then you won't be able to daemonize construct-daemon. Instead your going to need to run construct-dameon in a terminal session or screen or something. Just run `./bin/construct-daemon --exec` from the git repository to start the service (it will not fork).

