# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.12.0](https://github.com/tegapp/teg/compare/v0.11.0...v0.12.0) (2020-08-14)

**Note:** Version bump only for package @tegapp/schema





# [0.11.0](https://github.com/tegapp/teg/compare/v0.10.1...v0.11.0) (2020-08-06)

**Note:** Version bump only for package @tegapp/schema





# [0.10.0](https://github.com/tegapp/teg/compare/v0.9.1...v0.10.0) (2020-07-18)


### Features

* Add a "Move to top of queue" button for jobs ([f8f3faa](https://github.com/tegapp/teg/commit/f8f3faa))
* Added an option to swap the visual orientation of the XY axes to match the angle you use your printer from ([6e6619a](https://github.com/tegapp/teg/commit/6e6619a))





# [0.9.0](https://github.com/tegapp/teg/compare/v0.8.0...v0.9.0) (2020-05-18)


### Bug Fixes

* FINISH_TASK ([e21726f](https://github.com/tegapp/teg/commit/e21726f))
* job deletion bugs ([e6f7b1e](https://github.com/tegapp/teg/commit/e6f7b1e))


### Features

* Added sync option for execGCodes. GCode execution is now async by default. ([6ccebdf](https://github.com/tegapp/teg/commit/6ccebdf))
* Full 30 frame per second video streaming ([f7e5f00](https://github.com/tegapp/teg/commit/f7e5f00))
* Remote camera streaming ([5abda8c](https://github.com/tegapp/teg/commit/5abda8c))





# [0.8.0](https://github.com/teg/teg/compare/v0.7.0...v0.8.0) (2019-05-20)


* feat[API]: Removing logEntries from the GraphQL API until a need for them arises. ([ad70acb](https://github.com/teg/teg/commit/ad70acb))
* feat[API]: New Heater.history API co-locates temperature history within heater components ([45406bb](https://github.com/teg/teg/commit/45406bb))


### Features

* Add a GCode Terminal to the Manage UI ([f2ac418](https://github.com/teg/teg/commit/f2ac418))
* Add hasPendingUpdates Boolean! to GraphQL to introspect the update process. ([bd0d78c](https://github.com/teg/teg/commit/bd0d78c))
* Add host macros to the GCode Terminal UI and to GCodeHistoryEntry in the API ([4ba9d91](https://github.com/teg/teg/commit/4ba9d91))
* Add Teg version to config UI and GraphQL API ([f06edc8](https://github.com/teg/teg/commit/f06edc8))
* New GCode History API ([857dd67](https://github.com/teg/teg/commit/857dd67))
* Replace spoolCommands to spoolGCodes ([a501808](https://github.com/teg/teg/commit/a501808))


### BREAKING CHANGES

* Printer.logEntries has been removed.
* Printer.temperatureHistory has been removed in favour of Heater.history





# [0.7.0](https://github.com/teg/teg/compare/v0.6.0...v0.7.0) (2019-05-07)


### Features

* New 3D printer setup in Getting Started wizard. ([039e94b](https://github.com/teg/teg/commit/039e94b))





# [0.6.0](https://github.com/teg/teg/compare/v0.5.10...v0.6.0) (2019-04-09)


### Bug Fixes

* Fixed Delete Job button ([7bc4e16](https://github.com/teg/teg/commit/7bc4e16))


### Features

* Printer temperature history can now be live queried from GraphQL ([450ef39](https://github.com/teg/teg/commit/450ef39))
