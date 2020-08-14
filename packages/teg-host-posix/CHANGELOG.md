# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.12.0](https://github.com/teg/teg-host-posix/compare/v0.11.0...v0.12.0) (2020-08-14)

**Note:** Version bump only for package @tegapp/host-posix





# [0.11.0](https://github.com/teg/teg-host-posix/compare/v0.10.1...v0.11.0) (2020-08-06)


### Bug Fixes

* Added parsing for M21 and M21 blocking gcode support ([ed0cffa](https://github.com/teg/teg-host-posix/commit/ed0cffa))


### Features

* Added descriptions to extruder settings ([f5785ff](https://github.com/teg/teg-host-posix/commit/f5785ff))
* Added fast filament loading and removing for bowden cable 3D printer ([33a163a](https://github.com/teg/teg-host-posix/commit/33a163a))





## [0.10.1](https://github.com/teg/teg-host-posix/compare/v0.10.0...v0.10.1) (2020-07-19)

**Note:** Version bump only for package @tegapp/host-posix





# [0.10.0](https://github.com/teg/teg-host-posix/compare/v0.9.1...v0.10.0) (2020-07-18)


### Bug Fixes

* PIDs restart at zero and the pid file persisted after reboot may contain a pid that is reused by a new process post-reboot ([f120361](https://github.com/teg/teg-host-posix/commit/f120361))
* Updated snap build process and added support for M0 and M1 pause MCodes ([b9d911b](https://github.com/teg/teg-host-posix/commit/b9d911b))


### Features

* Added an option to swap the visual orientation of the XY axes to match the angle you use your printer from ([6e6619a](https://github.com/teg/teg-host-posix/commit/6e6619a))





## [0.9.1](https://github.com/teg/teg-host-posix/compare/v0.9.0...v0.9.1) (2020-05-18)

**Note:** Version bump only for package @tegapp/host-posix





# [0.9.0](https://github.com/teg/teg-host-posix/compare/v0.8.0...v0.9.0) (2020-05-18)


### Bug Fixes

* Added a pid arg for running outside of the snap ([481c3b4](https://github.com/teg/teg-host-posix/commit/481c3b4))
* Added keepAlive polling to the server ([87d5123](https://github.com/teg/teg-host-posix/commit/87d5123))
* Armv7 Pkg builds were not being updated in snap builds due to an incorrect directory ([4c9d085](https://github.com/teg/teg-host-posix/commit/4c9d085))
* delete task history ([cd6f99a](https://github.com/teg/teg-host-posix/commit/cd6f99a))
* gcodeHistoryBufferSize change ([b41c725](https://github.com/teg/teg-host-posix/commit/b41c725))
* graphql-things security patch ([a203d5a](https://github.com/teg/teg-host-posix/commit/a203d5a))
* graphql-things security update ([30693b8](https://github.com/teg/teg-host-posix/commit/30693b8))
* Irrecoverable reducer errors should reboot the server with an error state. ([92b0b4e](https://github.com/teg/teg-host-posix/commit/92b0b4e))
* Status changes were intermittently not updating the UI (Teg Host no longer drops messages from Teg Marlin when the buffer exceeds one message) ([1765b62](https://github.com/teg/teg-host-posix/commit/1765b62))
* Upgraded to a new graphql-live-subscription version adding stability improvements for live data. ([6ed354e](https://github.com/teg/teg-host-posix/commit/6ed354e))


### Features

* Added a video_providers field to Query as well as schema stitching to combine node and rust GraphQL ([1a877cb](https://github.com/teg/teg-host-posix/commit/1a877cb))
* Added TURN support for remote access ([582f26f](https://github.com/teg/teg-host-posix/commit/582f26f))
* Added video source configuration ([8c84207](https://github.com/teg/teg-host-posix/commit/8c84207))
* Upgraded graphql-things and removed Dat support for now. ([0299694](https://github.com/teg/teg-host-posix/commit/0299694))





# [0.8.0](https://github.com/teg/teg-host-posix/compare/v0.7.0...v0.8.0) (2019-05-20)


### Features

* Add Teg version to config UI and GraphQL API ([f06edc8](https://github.com/teg/teg-host-posix/commit/f06edc8))





# [0.7.0](https://github.com/teg/teg-host-posix/compare/v0.6.0...v0.7.0) (2019-05-07)


### Features

* Fresh redesign including a new getting started worflow. ([ad13b71](https://github.com/teg/teg-host-posix/commit/ad13b71))
* New 3D printer setup in Getting Started wizard. ([039e94b](https://github.com/teg/teg-host-posix/commit/039e94b))





# [0.6.0](https://github.com/teg/teg-host-posix/compare/v0.5.10...v0.6.0) (2019-04-09)


### Bug Fixes

* position polling interval revealed a bug that could attempt to despool two lines at once. Fixed by adding a explicit despoolComplete action and corresponding checks ([4907629](https://github.com/teg/teg-host-posix/commit/4907629))
* raspberry pi GPIO and delay extended gcode ([60003e3](https://github.com/teg/teg-host-posix/commit/60003e3))


### Features

* @tegapp/autodrop3D - an Autodrop3D plugin for Teg ([835b763](https://github.com/teg/teg-host-posix/commit/835b763))
* Automatic Printing for conveyors and auto-scrapers ([057ae50](https://github.com/teg/teg-host-posix/commit/057ae50))
* Now available in the snap store: https://snapcraft.io/teg ([73209bf](https://github.com/teg/teg-host-posix/commit/73209bf))
