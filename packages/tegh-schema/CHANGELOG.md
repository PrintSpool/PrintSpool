# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.8.0](https://github.com/tegh/tegh/compare/v0.7.0...v0.8.0) (2019-05-20)


* feat[API]: Removing logEntries from the GraphQL API until a need for them arises. ([ad70acb](https://github.com/tegh/tegh/commit/ad70acb))
* feat[API]: New Heater.history API co-locates temperature history within heater components ([45406bb](https://github.com/tegh/tegh/commit/45406bb))


### Features

* Add a GCode Terminal to the Manage UI ([f2ac418](https://github.com/tegh/tegh/commit/f2ac418))
* Add hasPendingUpdates Boolean! to GraphQL to introspect the update process. ([bd0d78c](https://github.com/tegh/tegh/commit/bd0d78c))
* Add host macros to the GCode Terminal UI and to GCodeHistoryEntry in the API ([4ba9d91](https://github.com/tegh/tegh/commit/4ba9d91))
* Add Tegh version to config UI and GraphQL API ([f06edc8](https://github.com/tegh/tegh/commit/f06edc8))
* New GCode History API ([857dd67](https://github.com/tegh/tegh/commit/857dd67))
* Replace spoolCommands to spoolGCodes ([a501808](https://github.com/tegh/tegh/commit/a501808))


### BREAKING CHANGES

* Printer.logEntries has been removed.
* Printer.temperatureHistory has been removed in favour of Heater.history





# [0.7.0](https://github.com/tegh/tegh/compare/v0.6.0...v0.7.0) (2019-05-07)


### Features

* New 3D printer setup in Getting Started wizard. ([039e94b](https://github.com/tegh/tegh/commit/039e94b))





# [0.6.0](https://github.com/tegh/tegh/compare/v0.5.10...v0.6.0) (2019-04-09)


### Bug Fixes

* Fixed Delete Job button ([7bc4e16](https://github.com/tegh/tegh/commit/7bc4e16))


### Features

* Printer temperature history can now be live queried from GraphQL ([450ef39](https://github.com/tegh/tegh/commit/450ef39))
