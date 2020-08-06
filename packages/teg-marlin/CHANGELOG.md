# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.11.0](https://github.com/tegapp/teg/compare/v0.10.1...v0.11.0) (2020-08-06)


### Bug Fixes

* Added parsing for M21 and M21 blocking gcode support ([ed0cffa](https://github.com/tegapp/teg/commit/ed0cffa))


### Features

* Added benchmarks for response parser ([14927d3](https://github.com/tegapp/teg/commit/14927d3))
* New rewritten GCode response parser with support for multi-line responses such as SD card MCodes ([f621e3e](https://github.com/tegapp/teg/commit/f621e3e))





## [0.10.1](https://github.com/tegapp/teg/compare/v0.10.0...v0.10.1) (2020-07-19)


### Bug Fixes

* Increased connection timeouts and fixed video ajax async issues ([f604ef9](https://github.com/tegapp/teg/commit/f604ef9))





# [0.10.0](https://github.com/tegapp/teg/compare/v0.9.1...v0.10.0) (2020-07-18)


### Bug Fixes

* TX traces should log text not byte arrays ([fbf3bfb](https://github.com/tegapp/teg/commit/fbf3bfb))
* Updated snap build process and added support for M0 and M1 pause MCodes ([b9d911b](https://github.com/tegapp/teg/commit/b9d911b))





## [0.9.1](https://github.com/tegapp/teg/compare/v0.9.0...v0.9.1) (2020-05-18)

**Note:** Version bump only for package @tegapp/marlin





# [0.9.0](https://github.com/tegapp/teg/compare/v0.8.0...v0.9.0) (2020-05-18)


### Bug Fixes

* Added a spin sleep to give time for Marlin to be ready to receive serial data ([a2cb246](https://github.com/tegapp/teg/commit/a2cb246))
* delay ready transition until the first ok is received ([8cb6602](https://github.com/tegapp/teg/commit/8cb6602))
* delete task history ([cd6f99a](https://github.com/tegapp/teg/commit/cd6f99a))
* Display the full error message for multiline errors ([90e238c](https://github.com/tegapp/teg/commit/90e238c))
* EStop ([a4f36c7](https://github.com/tegapp/teg/commit/a4f36c7))
* estop and baud rates. ([a199e49](https://github.com/tegapp/teg/commit/a199e49))
* Fixed edge cases in the terminal RX logs ([0e407b3](https://github.com/tegapp/teg/commit/0e407b3))
* job deletion bugs ([e6f7b1e](https://github.com/tegapp/teg/commit/e6f7b1e))
* Jobs should be marked as errored if the machine errors ([70abb45](https://github.com/tegapp/teg/commit/70abb45))
* simplifying gcode history ([f2a81b6](https://github.com/tegapp/teg/commit/f2a81b6))
* Some automatically sent GCodes were not being added to the history (Terminal in the  UI) ([8c05924](https://github.com/tegapp/teg/commit/8c05924))
* Status changes were intermittently not updating the UI (Teg Host no longer drops messages from Teg Marlin when the buffer exceeds one message) ([1765b62](https://github.com/tegapp/teg/commit/1765b62))
* unknown actual_temperature address: "e" = 0.0 deg C ([cb16d34](https://github.com/tegapp/teg/commit/cb16d34))


### Features

* Added a debug snap mode for running an external teg-marlin process outside the snap ([f0b735b](https://github.com/tegapp/teg/commit/f0b735b))
* Added configurable logging to teg-marlin via RUST_LOG env variable ([762b29d](https://github.com/tegapp/teg/commit/762b29d))
* Added video source configuration ([8c84207](https://github.com/tegapp/teg/commit/8c84207))
