# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.8.0](https://github.com/tegh/tegh/compare/v0.7.0...v0.8.0) (2019-05-20)


### Bug Fixes

* Terminal history no longer gets filled up and cleared by polling GCodes not visible to the user ([2b0a52c](https://github.com/tegh/tegh/commit/2b0a52c))


* feat[API]: New Heater.history API co-locates temperature history within heater components ([45406bb](https://github.com/tegh/tegh/commit/45406bb))


### Features

* Add a GCode Terminal to the Manage UI ([f2ac418](https://github.com/tegh/tegh/commit/f2ac418))
* Add host macros to the GCode Terminal UI and to GCodeHistoryEntry in the API ([4ba9d91](https://github.com/tegh/tegh/commit/4ba9d91))
* New GCode History API ([857dd67](https://github.com/tegh/tegh/commit/857dd67))


### BREAKING CHANGES

* Printer.temperatureHistory has been removed in favour of Heater.history





# [0.7.0](https://github.com/tegh/tegh/compare/v0.6.0...v0.7.0) (2019-05-07)


### Bug Fixes

* simulated devices will no longer be displayed in the serial port list ([2a34187](https://github.com/tegh/tegh/commit/2a34187))


### Features

* New 3D printer setup in Getting Started wizard. ([039e94b](https://github.com/tegh/tegh/commit/039e94b))





# [0.6.0](https://github.com/tegh/tegh/compare/v0.5.10...v0.6.0) (2019-04-09)


### Bug Fixes

* position polling interval revealed a bug that could attempt to despool two lines at once. Fixed by adding a explicit despoolComplete action and corresponding checks ([4907629](https://github.com/tegh/tegh/commit/4907629))
* removing initial zeros entry from temperature history ([c4aec3d](https://github.com/tegh/tegh/commit/c4aec3d))
* Updating tests ([9ac1dc4](https://github.com/tegh/tegh/commit/9ac1dc4))


### Features

* Printer temperature history can now be live queried from GraphQL ([450ef39](https://github.com/tegh/tegh/commit/450ef39))
