# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.8.0](https://github.com/tegh/tegh/compare/v0.7.0...v0.8.0) (2019-05-20)


* feat[API]: Removing logEntries from the GraphQL API until a need for them arises. ([ad70acb](https://github.com/tegh/tegh/commit/ad70acb))
* feat[API]: New Heater.history API co-locates temperature history within heater components ([45406bb](https://github.com/tegh/tegh/commit/45406bb))


### Bug Fixes

* Config form was not rendering a make and model drop down. ([fd5f3fd](https://github.com/tegh/tegh/commit/fd5f3fd))
* Load isConfigured flag from configs on host startup. ([d9b5b6a](https://github.com/tegh/tegh/commit/d9b5b6a))
* Regression: Job Card action wasn't opening on click ([cb678e7](https://github.com/tegh/tegh/commit/cb678e7))
* Terminal history no longer gets filled up and cleared by polling GCodes not visible to the user ([2b0a52c](https://github.com/tegh/tegh/commit/2b0a52c))
* Wait for the machine definition suggestions to load before displaying printer form ([4aac393](https://github.com/tegh/tegh/commit/4aac393))


### Features

* Add a GCode Terminal to the Manage UI ([f2ac418](https://github.com/tegh/tegh/commit/f2ac418))
* Add a GraphQL Playground page to the Manage UI for developers ([cc4678f](https://github.com/tegh/tegh/commit/cc4678f))
* Add hasPendingUpdates Boolean! to GraphQL to introspect the update process. ([bd0d78c](https://github.com/tegh/tegh/commit/bd0d78c))
* Add host macros to the GCode Terminal UI and to GCodeHistoryEntry in the API ([4ba9d91](https://github.com/tegh/tegh/commit/4ba9d91))
* Add Teg version to config UI and GraphQL API ([f06edc8](https://github.com/tegh/tegh/commit/f06edc8))
* Automic configs - configuration changes are now atomically saved to disk to prevent corruption ([66efe22](https://github.com/tegh/tegh/commit/66efe22))
* Integrated Print Preview in the Job Queue UI ([142b036](https://github.com/tegh/tegh/commit/142b036))
* New GCode History API ([857dd67](https://github.com/tegh/tegh/commit/857dd67))
* New mobile navigation accessible for smaller screens ([bcdbb9e](https://github.com/tegh/tegh/commit/bcdbb9e))
* Prevent modifications to configs while printing ([83ac819](https://github.com/tegh/tegh/commit/83ac819))
* Replace spoolCommands to spoolGCodes ([a501808](https://github.com/tegh/tegh/commit/a501808))
* Top navigation redesign. Streamlined all buttons into one consistent navigation bar. ([2a7fa98](https://github.com/tegh/tegh/commit/2a7fa98))


### BREAKING CHANGES

* Printer.logEntries has been removed.
* Printer.temperatureHistory has been removed in favour of Heater.history





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

* @tegapp/autodrop3D - an Autodrop3D plugin for Teg ([835b763](https://github.com/tegh/tegh/commit/835b763))
* AutoDrop 3D plugin ([d972a54](https://github.com/tegh/tegh/commit/d972a54))
* Automatic Printing for conveyors and auto-scrapers ([057ae50](https://github.com/tegh/tegh/commit/057ae50))
* Custom Dockerfile for drone builds ([bb9773c](https://github.com/tegh/tegh/commit/bb9773c))
* drone.io continuous build pipeline for Teg snaps ([88d5544](https://github.com/tegh/tegh/commit/88d5544))
* New GCode Hooks: beforePrintHook and afterPrintHook ([25835a0](https://github.com/tegh/tegh/commit/25835a0))
* New Job Queue and Autodrop macros: spoolNextJobFile, spoolJobFile and fetchAutodropJob ([e894fcf](https://github.com/tegh/tegh/commit/e894fcf))
* Now available in the snap store: https://snapcraft.io/tegh ([73209bf](https://github.com/tegh/tegh/commit/73209bf))
* Printer temperature history can now be live queried from GraphQL ([450ef39](https://github.com/tegh/tegh/commit/450ef39))
