# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.7.0](https://github.com/tegh/tegh/compare/v0.6.0...v0.7.0) (2019-05-07)


### Bug Fixes

* added missing viewport meta tag. Fixes responsive breakpoint issues in Chrome ([2425f63](https://github.com/tegh/tegh/commit/2425f63))
* make landing page copy readable on mobile ([3061e04](https://github.com/tegh/tegh/commit/3061e04))
* memoization null value error ([9f4c9f0](https://github.com/tegh/tegh/commit/9f4c9f0))
* serial port list was not being populated on Printer Settings page ([04c18bc](https://github.com/tegh/tegh/commit/04c18bc))
* simulated devices will no longer be displayed in the serial port list ([2a34187](https://github.com/tegh/tegh/commit/2a34187))


### Features

* Fresh redesign including a new getting started worflow. ([ad13b71](https://github.com/tegh/tegh/commit/ad13b71))
* Getting Started wizard now only prompts the user to set up their printer once on initial connection. ([ec4946a](https://github.com/tegh/tegh/commit/ec4946a))
* New 3D printer setup in Getting Started wizard. ([039e94b](https://github.com/tegh/tegh/commit/039e94b))
* The serial port dropdown now instructs the user to plug in their 3D printer instead of showing an empty list ([850b3eb](https://github.com/tegh/tegh/commit/850b3eb))





# [0.6.0](https://github.com/tegh/tegh/compare/v0.5.10...v0.6.0) (2019-04-09)


### Bug Fixes

* Add --skip-optional to all yarn install scripts ([d6f3fdc](https://github.com/tegh/tegh/commit/d6f3fdc))
* automatic job queue despooling create new job bugs ([ce5e645](https://github.com/tegh/tegh/commit/ce5e645))
* eStop should be an emergency task ([35f24a3](https://github.com/tegh/tegh/commit/35f24a3))
* fix jobQueueReducer tests ([e0aaad2](https://github.com/tegh/tegh/commit/e0aaad2))
* Fixed Delete Job button ([7bc4e16](https://github.com/tegh/tegh/commit/7bc4e16))
* packages/tegh-web-ui/package.json to reduce vulnerabilities ([b56768a](https://github.com/tegh/tegh/commit/b56768a))
* position polling interval revealed a bug that could attempt to despool two lines at once. Fixed by adding a explicit despoolComplete action and corresponding checks ([4907629](https://github.com/tegh/tegh/commit/4907629))
* print progress is now relayed to AutoDrop correctly ([7ec9bba](https://github.com/tegh/tegh/commit/7ec9bba))
* raspberry pi GPIO and delay extended gcode ([60003e3](https://github.com/tegh/tegh/commit/60003e3))
* redux-loop Cmd.list bug was preventing autodrop jobs from being created ([3718782](https://github.com/tegh/tegh/commit/3718782))
* removing initial zeros entry from temperature history ([c4aec3d](https://github.com/tegh/tegh/commit/c4aec3d))
* typo in job queue handling of request spool job file ([19deead](https://github.com/tegh/tegh/commit/19deead))
* uncomment  injection ([a18ae63](https://github.com/tegh/tegh/commit/a18ae63))
* Updating tests ([9ac1dc4](https://github.com/tegh/tegh/commit/9ac1dc4))


### Features

* @tegh/autodrop3D - an Autodrop3D plugin for Tegh ([835b763](https://github.com/tegh/tegh/commit/835b763))
* AutoDrop 3D plugin ([d972a54](https://github.com/tegh/tegh/commit/d972a54))
* Automatic Printing for conveyors and auto-scrapers ([057ae50](https://github.com/tegh/tegh/commit/057ae50))
* Custom Dockerfile for drone builds ([bb9773c](https://github.com/tegh/tegh/commit/bb9773c))
* drone.io continuous build pipeline for Tegh snaps ([88d5544](https://github.com/tegh/tegh/commit/88d5544))
* New GCode Hooks: beforePrintHook and afterPrintHook ([25835a0](https://github.com/tegh/tegh/commit/25835a0))
* New Job Queue and Autodrop macros: spoolNextJobFile, spoolJobFile and fetchAutodropJob ([e894fcf](https://github.com/tegh/tegh/commit/e894fcf))
* Now available in the snap store: https://snapcraft.io/tegh ([73209bf](https://github.com/tegh/tegh/commit/73209bf))
* Printer temperature history can now be live queried from GraphQL ([450ef39](https://github.com/tegh/tegh/commit/450ef39))
