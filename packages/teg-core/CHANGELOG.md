# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.8.0](https://github.com/tegh/tegh-host-posix/compare/v0.7.0...v0.8.0) (2019-05-20)


* feat[API]: Removing logEntries from the GraphQL API until a need for them arises. ([ad70acb](https://github.com/tegh/tegh-host-posix/commit/ad70acb))
* feat[API]: New Heater.history API co-locates temperature history within heater components ([45406bb](https://github.com/tegh/tegh-host-posix/commit/45406bb))


### Bug Fixes

* Load isConfigured flag from configs on host startup. ([d9b5b6a](https://github.com/tegh/tegh-host-posix/commit/d9b5b6a))
* Terminal history no longer gets filled up and cleared by polling GCodes not visible to the user ([2b0a52c](https://github.com/tegh/tegh-host-posix/commit/2b0a52c))


### Features

* Add a GCode Terminal to the Manage UI ([f2ac418](https://github.com/tegh/tegh-host-posix/commit/f2ac418))
* Add hasPendingUpdates Boolean! to GraphQL to introspect the update process. ([bd0d78c](https://github.com/tegh/tegh-host-posix/commit/bd0d78c))
* Add host macros to the GCode Terminal UI and to GCodeHistoryEntry in the API ([4ba9d91](https://github.com/tegh/tegh-host-posix/commit/4ba9d91))
* Add Teg version to config UI and GraphQL API ([f06edc8](https://github.com/tegh/tegh-host-posix/commit/f06edc8))
* Automic configs - configuration changes are now atomically saved to disk to prevent corruption ([66efe22](https://github.com/tegh/tegh-host-posix/commit/66efe22))
* New GCode History API ([857dd67](https://github.com/tegh/tegh-host-posix/commit/857dd67))
* Prevent modifications to configs while printing ([83ac819](https://github.com/tegh/tegh-host-posix/commit/83ac819))
* Replace spoolCommands to spoolGCodes ([a501808](https://github.com/tegh/tegh-host-posix/commit/a501808))


### BREAKING CHANGES

* Printer.logEntries has been removed.
* Printer.temperatureHistory has been removed in favour of Heater.history





# [0.7.0](https://github.com/tegh/tegh-host-posix/compare/v0.6.0...v0.7.0) (2019-05-07)


### Bug Fixes

* simulated devices will no longer be displayed in the serial port list ([2a34187](https://github.com/tegh/tegh-host-posix/commit/2a34187))


### Features

* New 3D printer setup in Getting Started wizard. ([039e94b](https://github.com/tegh/tegh-host-posix/commit/039e94b))





# [0.6.0](https://github.com/tegh/tegh-host-posix/compare/v0.5.10...v0.6.0) (2019-04-09)


### Bug Fixes

* automatic job queue despooling create new job bugs ([ce5e645](https://github.com/tegh/tegh-host-posix/commit/ce5e645))
* eStop should be an emergency task ([35f24a3](https://github.com/tegh/tegh-host-posix/commit/35f24a3))
* fix jobQueueReducer tests ([e0aaad2](https://github.com/tegh/tegh-host-posix/commit/e0aaad2))
* position polling interval revealed a bug that could attempt to despool two lines at once. Fixed by adding a explicit despoolComplete action and corresponding checks ([4907629](https://github.com/tegh/tegh-host-posix/commit/4907629))
* redux-loop Cmd.list bug was preventing autodrop jobs from being created ([3718782](https://github.com/tegh/tegh-host-posix/commit/3718782))
* typo in job queue handling of request spool job file ([19deead](https://github.com/tegh/tegh-host-posix/commit/19deead))
* Updating tests ([9ac1dc4](https://github.com/tegh/tegh-host-posix/commit/9ac1dc4))


### Features

* Automatic Printing for conveyors and auto-scrapers ([057ae50](https://github.com/tegh/tegh-host-posix/commit/057ae50))
* New GCode Hooks: beforePrintHook and afterPrintHook ([25835a0](https://github.com/tegh/tegh-host-posix/commit/25835a0))
* New Job Queue and Autodrop macros: spoolNextJobFile, spoolJobFile and fetchAutodropJob ([e894fcf](https://github.com/tegh/tegh-host-posix/commit/e894fcf))
* Printer temperature history can now be live queried from GraphQL ([450ef39](https://github.com/tegh/tegh-host-posix/commit/450ef39))
