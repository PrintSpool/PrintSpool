# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.10.0](https://github.com/tegapp/teg/compare/v0.9.1...v0.10.0) (2020-07-18)


### Features

* Added a continuous movement mode in Maintenance ([9cda8e3](https://github.com/tegapp/teg/commit/9cda8e3))





# [0.9.0](https://github.com/tegapp/teg/compare/v0.8.0...v0.9.0) (2020-05-18)


### Bug Fixes

* Fixed intermittent bug where the printer would move to the extremes of each axis and extrude quickly. Turns out some gcode files don't reset movement to absolute so if a print started after a relative move it's movements would be mistakenly interpretted as relative. ([143ab70](https://github.com/tegapp/teg/commit/143ab70))





# [0.8.0](https://github.com/teg/teg/compare/v0.7.0...v0.8.0) (2019-05-20)

**Note:** Version bump only for package @tegapp/macros-default





# [0.7.0](https://github.com/teg/teg/compare/v0.6.0...v0.7.0) (2019-05-07)

**Note:** Version bump only for package @tegapp/macros-default





# [0.6.0](https://github.com/teg/teg/compare/v0.5.10...v0.6.0) (2019-04-09)


### Bug Fixes

* raspberry pi GPIO and delay extended gcode ([60003e3](https://github.com/teg/teg/commit/60003e3))


### Features

* New Job Queue and Autodrop macros: spoolNextJobFile, spoolJobFile and fetchAutodropJob ([e894fcf](https://github.com/teg/teg/commit/e894fcf))
