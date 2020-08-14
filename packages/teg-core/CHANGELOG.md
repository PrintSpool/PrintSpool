# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.12.1](https://github.com/teg/teg-host-posix/compare/v0.12.0...v0.12.1) (2020-08-14)


### Bug Fixes

* Fixed error when users attempted to consume an invite ([cb9d574](https://github.com/teg/teg-host-posix/commit/cb9d574))





# [0.12.0](https://github.com/teg/teg-host-posix/compare/v0.11.0...v0.12.0) (2020-08-14)


### Features

* Completely rewritten continuous movement substantially decreases stutters and overshoots ([bce67fc](https://github.com/teg/teg-host-posix/commit/bce67fc))





# [0.11.0](https://github.com/teg/teg-host-posix/compare/v0.10.1...v0.11.0) (2020-08-06)


### Bug Fixes

* After a mid-task teg-marlin panic the teg-core server lost the ability to send tasks to the printer due to the task state never getting updated when onError == null. ([add48b0](https://github.com/teg/teg-host-posix/commit/add48b0))


### Features

* Added descriptions to extruder settings ([f5785ff](https://github.com/teg/teg-host-posix/commit/f5785ff))
* Added fast filament loading and removing for bowden cable 3D printer ([33a163a](https://github.com/teg/teg-host-posix/commit/33a163a))
* New rewritten GCode response parser with support for multi-line responses such as SD card MCodes ([f621e3e](https://github.com/teg/teg-host-posix/commit/f621e3e))





# [0.10.0](https://github.com/teg/teg-host-posix/compare/v0.9.1...v0.10.0) (2020-07-18)


### Bug Fixes

* Added error handling to useExecGcodes and fixed Confirm dialog so that it no longer causes react errors ([16d5b71](https://github.com/teg/teg-host-posix/commit/16d5b71))
* Connection randomly freezes when creating a toolhead ([ea67ae3](https://github.com/teg/teg-host-posix/commit/ea67ae3))
* Fixed max temperature history length limiting ([1bac810](https://github.com/teg/teg-host-posix/commit/1bac810))
* Fixed task annotations for swapping filaments via gcodes ([ffd5780](https://github.com/teg/teg-host-posix/commit/ffd5780))
* history length ([0ceaa66](https://github.com/teg/teg-host-posix/commit/0ceaa66))
* Prevented uploading of non-gcode files ([6bd4f45](https://github.com/teg/teg-host-posix/commit/6bd4f45))
* Removed reference to undocumented extended gcodes ([8a03df0](https://github.com/teg/teg-host-posix/commit/8a03df0))


### Features

* Add a "Move to top of queue" button for jobs ([f8f3faa](https://github.com/teg/teg-host-posix/commit/f8f3faa))
* Added a Print Now button to skip directly to printing ([2324553](https://github.com/teg/teg-host-posix/commit/2324553))
* Added an option to swap the visual orientation of the XY axes to match the angle you use your printer from ([6e6619a](https://github.com/teg/teg-host-posix/commit/6e6619a))





# [0.9.0](https://github.com/teg/teg-host-posix/compare/v0.8.0...v0.9.0) (2020-05-18)


### Bug Fixes

* Added missing npm dependencies ([3612e58](https://github.com/teg/teg-host-posix/commit/3612e58))
* delay ready transition until the first ok is received ([8cb6602](https://github.com/teg/teg-host-posix/commit/8cb6602))
* delete task history ([cd6f99a](https://github.com/teg/teg-host-posix/commit/cd6f99a))
* FINISH_TASK ([e21726f](https://github.com/teg/teg-host-posix/commit/e21726f))
* Fixed consumeInvite mutation ([5b8fd6a](https://github.com/teg/teg-host-posix/commit/5b8fd6a))
* graphql-things security patch ([a203d5a](https://github.com/teg/teg-host-posix/commit/a203d5a))
* graphql-things security update ([30693b8](https://github.com/teg/teg-host-posix/commit/30693b8))
* Irrecoverable reducer errors should reboot the server with an error state. ([92b0b4e](https://github.com/teg/teg-host-posix/commit/92b0b4e))
* job deletion bugs ([e6f7b1e](https://github.com/teg/teg-host-posix/commit/e6f7b1e))
* Jobs should be marked as errored if the machine errors ([70abb45](https://github.com/teg/teg-host-posix/commit/70abb45))
* Killing teg-marlin changes the printer status to disconnected ([ef2864b](https://github.com/teg/teg-host-posix/commit/ef2864b))
* Removed legacy instances of user.name ([e565cc2](https://github.com/teg/teg-host-posix/commit/e565cc2))
* simplifying gcode history ([f2a81b6](https://github.com/teg/teg-host-posix/commit/f2a81b6))
* Status changes were intermittently not updating the UI (Teg Host no longer drops messages from Teg Marlin when the buffer exceeds one message) ([1765b62](https://github.com/teg/teg-host-posix/commit/1765b62))
* Terminal does not display until graphql is loaded. ([69aac37](https://github.com/teg/teg-host-posix/commit/69aac37))
* Terminal limit was slicing from the wrong end of the array ([aea5309](https://github.com/teg/teg-host-posix/commit/aea5309))
* Upgraded to a new graphql-live-subscription version adding stability improvements for live data. ([6ed354e](https://github.com/teg/teg-host-posix/commit/6ed354e))


### Features

* Added a video_providers field to Query as well as schema stitching to combine node and rust GraphQL ([1a877cb](https://github.com/teg/teg-host-posix/commit/1a877cb))
* Added login and signup ([12b7330](https://github.com/teg/teg-host-posix/commit/12b7330))
* Added multi-user support ([58b41c8](https://github.com/teg/teg-host-posix/commit/58b41c8))
* Added sync option for execGCodes. GCode execution is now async by default. ([6ccebdf](https://github.com/teg/teg-host-posix/commit/6ccebdf))
* Added teg-add-invite command ([33d6010](https://github.com/teg/teg-host-posix/commit/33d6010))
* Added TURN support for remote access ([582f26f](https://github.com/teg/teg-host-posix/commit/582f26f))
* Added video source configuration ([8c84207](https://github.com/teg/teg-host-posix/commit/8c84207))
* Added video sources drop down menu ([4cbc3f7](https://github.com/teg/teg-host-posix/commit/4cbc3f7))
* Full 30 frame per second video streaming ([f7e5f00](https://github.com/teg/teg-host-posix/commit/f7e5f00))
* Remote camera streaming ([5abda8c](https://github.com/teg/teg-host-posix/commit/5abda8c))
* Upgraded graphql-things and removed Dat support for now. ([0299694](https://github.com/teg/teg-host-posix/commit/0299694))





# [0.8.0](https://github.com/teg/teg-host-posix/compare/v0.7.0...v0.8.0) (2019-05-20)


* feat[API]: Removing logEntries from the GraphQL API until a need for them arises. ([ad70acb](https://github.com/teg/teg-host-posix/commit/ad70acb))
* feat[API]: New Heater.history API co-locates temperature history within heater components ([45406bb](https://github.com/teg/teg-host-posix/commit/45406bb))


### Bug Fixes

* Load isConfigured flag from configs on host startup. ([d9b5b6a](https://github.com/teg/teg-host-posix/commit/d9b5b6a))
* Terminal history no longer gets filled up and cleared by polling GCodes not visible to the user ([2b0a52c](https://github.com/teg/teg-host-posix/commit/2b0a52c))


### Features

* Add a GCode Terminal to the Manage UI ([f2ac418](https://github.com/teg/teg-host-posix/commit/f2ac418))
* Add hasPendingUpdates Boolean! to GraphQL to introspect the update process. ([bd0d78c](https://github.com/teg/teg-host-posix/commit/bd0d78c))
* Add host macros to the GCode Terminal UI and to GCodeHistoryEntry in the API ([4ba9d91](https://github.com/teg/teg-host-posix/commit/4ba9d91))
* Add Teg version to config UI and GraphQL API ([f06edc8](https://github.com/teg/teg-host-posix/commit/f06edc8))
* Automic configs - configuration changes are now atomically saved to disk to prevent corruption ([66efe22](https://github.com/teg/teg-host-posix/commit/66efe22))
* New GCode History API ([857dd67](https://github.com/teg/teg-host-posix/commit/857dd67))
* Prevent modifications to configs while printing ([83ac819](https://github.com/teg/teg-host-posix/commit/83ac819))
* Replace spoolCommands to spoolGCodes ([a501808](https://github.com/teg/teg-host-posix/commit/a501808))


### BREAKING CHANGES

* Printer.logEntries has been removed.
* Printer.temperatureHistory has been removed in favour of Heater.history





# [0.7.0](https://github.com/teg/teg-host-posix/compare/v0.6.0...v0.7.0) (2019-05-07)


### Bug Fixes

* simulated devices will no longer be displayed in the serial port list ([2a34187](https://github.com/teg/teg-host-posix/commit/2a34187))


### Features

* New 3D printer setup in Getting Started wizard. ([039e94b](https://github.com/teg/teg-host-posix/commit/039e94b))





# [0.6.0](https://github.com/teg/teg-host-posix/compare/v0.5.10...v0.6.0) (2019-04-09)


### Bug Fixes

* automatic job queue despooling create new job bugs ([ce5e645](https://github.com/teg/teg-host-posix/commit/ce5e645))
* eStop should be an emergency task ([35f24a3](https://github.com/teg/teg-host-posix/commit/35f24a3))
* fix jobQueueReducer tests ([e0aaad2](https://github.com/teg/teg-host-posix/commit/e0aaad2))
* position polling interval revealed a bug that could attempt to despool two lines at once. Fixed by adding a explicit despoolComplete action and corresponding checks ([4907629](https://github.com/teg/teg-host-posix/commit/4907629))
* redux-loop Cmd.list bug was preventing autodrop jobs from being created ([3718782](https://github.com/teg/teg-host-posix/commit/3718782))
* typo in job queue handling of request spool job file ([19deead](https://github.com/teg/teg-host-posix/commit/19deead))
* Updating tests ([9ac1dc4](https://github.com/teg/teg-host-posix/commit/9ac1dc4))


### Features

* Automatic Printing for conveyors and auto-scrapers ([057ae50](https://github.com/teg/teg-host-posix/commit/057ae50))
* New GCode Hooks: beforePrintHook and afterPrintHook ([25835a0](https://github.com/teg/teg-host-posix/commit/25835a0))
* New Job Queue and Autodrop macros: spoolNextJobFile, spoolJobFile and fetchAutodropJob ([e894fcf](https://github.com/teg/teg-host-posix/commit/e894fcf))
* Printer temperature history can now be live queried from GraphQL ([450ef39](https://github.com/teg/teg-host-posix/commit/450ef39))
