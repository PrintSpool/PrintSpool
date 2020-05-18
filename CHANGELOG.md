# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.9.0](https://github.com/tegapp/teg/compare/v0.8.0...v0.9.0) (2020-05-18)


### Bug Fixes

* Added a pid arg for running outside of the snap ([481c3b4](https://github.com/tegapp/teg/commit/481c3b4))
* Added a spin sleep to give time for Marlin to be ready to receive serial data ([a2cb246](https://github.com/tegapp/teg/commit/a2cb246))
* Added keepAlive polling to the server ([87d5123](https://github.com/tegapp/teg/commit/87d5123))
* Added missing npm dependencies ([3612e58](https://github.com/tegapp/teg/commit/3612e58))
* Allow users to consume multiple invites to prevent them from being locked out of a printer due to misconfiguration ([af9d44f](https://github.com/tegapp/teg/commit/af9d44f))
* Always load ice servers (fixes onboarding new users over TURN) ([23c1d9c](https://github.com/tegapp/teg/commit/23c1d9c))
* Armv7 Pkg builds were not being updated in snap builds due to an incorrect directory ([4c9d085](https://github.com/tegapp/teg/commit/4c9d085))
* build fixes. ([a8f6057](https://github.com/tegapp/teg/commit/a8f6057))
* Connection timeouts were crashing the frontend. ([4a4acac](https://github.com/tegapp/teg/commit/4a4acac))
* delay ready transition until the first ok is received ([8cb6602](https://github.com/tegapp/teg/commit/8cb6602))
* delete task history ([cd6f99a](https://github.com/tegapp/teg/commit/cd6f99a))
* Despooling the next GCode after estop + reset to prevent race conditions when rapidly executing estop/reset commands. ([1e6692d](https://github.com/tegapp/teg/commit/1e6692d))
* Display the full error message for multiline errors ([90e238c](https://github.com/tegapp/teg/commit/90e238c))
* driver-serial-gcode and core macros are now enabled by default ([b212da5](https://github.com/tegapp/teg/commit/b212da5))
* EStop ([a4f36c7](https://github.com/tegapp/teg/commit/a4f36c7))
* estop and baud rates. ([a199e49](https://github.com/tegapp/teg/commit/a199e49))
* EStop and reset now despool correctly. Added a timestamp to prevent serial timeout line number collisions. ([4361f13](https://github.com/tegapp/teg/commit/4361f13))
* FINISH_TASK ([e21726f](https://github.com/tegapp/teg/commit/e21726f))
* Fixed build process and docs based on fresh OS install ([781fcb0](https://github.com/tegapp/teg/commit/781fcb0))
* Fixed chrome and mobile donate buttons rendering issues. ([aa70c37](https://github.com/tegapp/teg/commit/aa70c37))
* Fixed consumeInvite mutation ([5b8fd6a](https://github.com/tegapp/teg/commit/5b8fd6a))
* Fixed delete machine dialog submissions ([1148ce3](https://github.com/tegapp/teg/commit/1148ce3))
* Fixed edge cases in the terminal RX logs ([0e407b3](https://github.com/tegapp/teg/commit/0e407b3))
* Fixed intermittent bug where the printer would move to the extremes of each axis and extrude quickly. Turns out some gcode files don't reset movement to absolute so if a print started after a relative move it's movements would be mistakenly interpretted as relative. ([143ab70](https://github.com/tegapp/teg/commit/143ab70))
* Fixed teg-auth armv7 build script ([0eb33d7](https://github.com/tegapp/teg/commit/0eb33d7))
* Force all domains to redirect to tegapp.io ([00b3bec](https://github.com/tegapp/teg/commit/00b3bec))
* gcodeHistoryBufferSize change ([b41c725](https://github.com/tegapp/teg/commit/b41c725))
* Google Analytics was not loading ([6635afd](https://github.com/tegapp/teg/commit/6635afd))
* graphql-things security patch ([a203d5a](https://github.com/tegapp/teg/commit/a203d5a))
* graphql-things security update ([30693b8](https://github.com/tegapp/teg/commit/30693b8))
* High priority and preemptive tasks were not preempting long running print jobs ([69fba86](https://github.com/tegapp/teg/commit/69fba86))
* HTTP site 404s. ([d1010c5](https://github.com/tegapp/teg/commit/d1010c5))
* Invalid macro calls no longer put the server into an unrecoverable error state. ([ba39059](https://github.com/tegapp/teg/commit/ba39059))
* Invites should not be consumed by previously authorized users. ([fd03db8](https://github.com/tegapp/teg/commit/fd03db8))
* Irrecoverable reducer errors should reboot the server with an error state. ([92b0b4e](https://github.com/tegapp/teg/commit/92b0b4e))
* job deletion bugs ([e6f7b1e](https://github.com/tegapp/teg/commit/e6f7b1e))
* Jobs should be marked as errored if the machine errors ([70abb45](https://github.com/tegapp/teg/commit/70abb45))
* Killing teg-marlin changes the printer status to disconnected ([ef2864b](https://github.com/tegapp/teg/commit/ef2864b))
* Landing Page headers now display correctly on small screens and Beaker Browser. ([7a73318](https://github.com/tegapp/teg/commit/7a73318))
* More helpful logging be default ([8133262](https://github.com/tegapp/teg/commit/8133262))
* Mutations no longer error silently. Errors are now displayed to the user. ([2b64452](https://github.com/tegapp/teg/commit/2b64452))
* Removed legacy instances of user.name ([e565cc2](https://github.com/tegapp/teg/commit/e565cc2))
* Replacing history.goBack with history.push('../') for more consistent back/cancel behaviour. ([23afacf](https://github.com/tegapp/teg/commit/23afacf))
* Reset each config dialog after it is closed ([fbb72d0](https://github.com/tegapp/teg/commit/fbb72d0))
* Reset the add invite state after the dialog is closed ([8384e26](https://github.com/tegapp/teg/commit/8384e26))
* script permissions ([c681d6e](https://github.com/tegapp/teg/commit/c681d6e))
* simplifying gcode history ([f2a81b6](https://github.com/tegapp/teg/commit/f2a81b6))
* Some automatically sent GCodes were not being added to the history (Terminal in the  UI) ([8c05924](https://github.com/tegapp/teg/commit/8c05924))
* Status changes were intermittently not updating the UI (Teg Host no longer drops messages from Teg Marlin when the buffer exceeds one message) ([1765b62](https://github.com/tegapp/teg/commit/1765b62))
* Terminal does not display until graphql is loaded. ([69aac37](https://github.com/tegapp/teg/commit/69aac37))
* Terminal limit was slicing from the wrong end of the array ([aea5309](https://github.com/tegapp/teg/commit/aea5309))
* unknown actual_temperature address: "e" = 0.0 deg C ([cb16d34](https://github.com/tegapp/teg/commit/cb16d34))
* Updated to core20 in order to fix GCC compatibility with remote build servers ([b9933ec](https://github.com/tegapp/teg/commit/b9933ec))
* Upgraded to a new graphql-live-subscription version adding stability improvements for live data. ([6ed354e](https://github.com/tegapp/teg/commit/6ed354e))
* Video connection now uses same TURN servers as data ([c46faef](https://github.com/tegapp/teg/commit/c46faef))


### Features

* Added a debug snap mode for running an external teg-marlin process outside the snap ([f0b735b](https://github.com/tegapp/teg/commit/f0b735b))
* Added a new error screen. ([fd3398c](https://github.com/tegapp/teg/commit/fd3398c))
* Added a privacy policy page. ([a550cf8](https://github.com/tegapp/teg/commit/a550cf8))
* Added a Settings page for the user to manage their 3D printers ([df62420](https://github.com/tegapp/teg/commit/df62420))
* Added a video_providers field to Query as well as schema stitching to combine node and rust GraphQL ([1a877cb](https://github.com/tegapp/teg/commit/1a877cb))
* Added config live reloading to teg-auth ([3a25f59](https://github.com/tegapp/teg/commit/3a25f59))
* Added configurable logging to teg-marlin via RUST_LOG env variable ([762b29d](https://github.com/tegapp/teg/commit/762b29d))
* Added database creation to bootstrap script ([9244e06](https://github.com/tegapp/teg/commit/9244e06))
* Added login and signup ([12b7330](https://github.com/tegapp/teg/commit/12b7330))
* Added multi-user support ([58b41c8](https://github.com/tegapp/teg/commit/58b41c8))
* Added sync option for execGCodes. GCode execution is now async by default. ([6ccebdf](https://github.com/tegapp/teg/commit/6ccebdf))
* Added teg-add-invite command ([33d6010](https://github.com/tegapp/teg/commit/33d6010))
* Added TURN support for remote access ([582f26f](https://github.com/tegapp/teg/commit/582f26f))
* Added video source configuration ([8c84207](https://github.com/tegapp/teg/commit/8c84207))
* Added video sources drop down menu ([4cbc3f7](https://github.com/tegapp/teg/commit/4cbc3f7))
* Finishing the onboarding process sends the user to the print queue ([8954955](https://github.com/tegapp/teg/commit/8954955))
* Full 30 frame per second video streaming ([f7e5f00](https://github.com/tegapp/teg/commit/f7e5f00))
* Improved landing page design for small screens. ([b8c63a6](https://github.com/tegapp/teg/commit/b8c63a6))
* Macros have been reworked - all macro calls are ID based (not address based) and heater macros have a new 'sync' option ([cbde5c9](https://github.com/tegapp/teg/commit/cbde5c9))
* Moved machine name out of the top nav. Top nav title consistantly links to the home page now. ([9cd6278](https://github.com/tegapp/teg/commit/9cd6278))
* Navigation redesign ([9bad1a5](https://github.com/tegapp/teg/commit/9bad1a5))
* New connection rewrite brings FireFox, Brave and Chrome support. ([b2555bf](https://github.com/tegapp/teg/commit/b2555bf))
* New filament swap workflow ([50cdc0b](https://github.com/tegapp/teg/commit/50cdc0b))
* New logo! ([8e359c9](https://github.com/tegapp/teg/commit/8e359c9))
* New setMaterials macro for swapping extruder filaments. ([c2cd23d](https://github.com/tegapp/teg/commit/c2cd23d))
* New shortened URLs ([e2b17d5](https://github.com/tegapp/teg/commit/e2b17d5))
* Reduced client-side javascript file size by a little under half. ([489dbd3](https://github.com/tegapp/teg/commit/489dbd3))
* Reduced HTTP site javascript to ~550KB ([ad98a4a](https://github.com/tegapp/teg/commit/ad98a4a))
* Remote camera streaming ([5abda8c](https://github.com/tegapp/teg/commit/5abda8c))
* Removed all legacy GraphQL fields. ([81a8811](https://github.com/tegapp/teg/commit/81a8811))
* Renamed navigation links based on feedback ([12ea848](https://github.com/tegapp/teg/commit/12ea848))
* Replaced setGPIO with setGPIOs. Now multiple GPIOs can be set at once ([6997b35](https://github.com/tegapp/teg/commit/6997b35))
* Reverting back to addresses. IDs are non-configurable / printer specific. GCode should be able to be portable between machines. ([6fc80e7](https://github.com/tegapp/teg/commit/6fc80e7))
* Simpler JSON GCode format: { g1: { x: 10 } } ([d957d21](https://github.com/tegapp/teg/commit/d957d21))
* Switched from hash-based routes to real browser routes. So fancy! ([b8c3906](https://github.com/tegapp/teg/commit/b8c3906))
* Switched from Webpack to Parsel, optimized the bundle size and added code splitting. The bundle size for the landing page is down by an order of magnitude so Tegh should load much faster on slower connections. ([ff62344](https://github.com/tegapp/teg/commit/ff62344))
* Synchronous GCode Execution ([839b4c0](https://github.com/tegapp/teg/commit/839b4c0))
* Updates Getting Started copy ([4917d96](https://github.com/tegapp/teg/commit/4917d96))
* Upgraded graphql-things and removed Dat support for now. ([0299694](https://github.com/tegapp/teg/commit/0299694))
* Upgraded to Material UI 4 ([000dec0](https://github.com/tegapp/teg/commit/000dec0))


### BREAKING CHANGES

* spoolGCodes has been replaced by execGCodes which block until the GCodes are finished and any printer movements are complete.





# [0.8.0](https://github.com/teg/teg/compare/v0.7.0...v0.8.0) (2019-05-20)


* feat[API]: Removing logEntries from the GraphQL API until a need for them arises. ([ad70acb](https://github.com/teg/teg/commit/ad70acb))
* feat[API]: New Heater.history API co-locates temperature history within heater components ([45406bb](https://github.com/teg/teg/commit/45406bb))


### Bug Fixes

* Config form was not rendering a make and model drop down. ([fd5f3fd](https://github.com/teg/teg/commit/fd5f3fd))
* Load isConfigured flag from configs on host startup. ([d9b5b6a](https://github.com/teg/teg/commit/d9b5b6a))
* Regression: Job Card action wasn't opening on click ([cb678e7](https://github.com/teg/teg/commit/cb678e7))
* Terminal history no longer gets filled up and cleared by polling GCodes not visible to the user ([2b0a52c](https://github.com/teg/teg/commit/2b0a52c))
* Wait for the machine definition suggestions to load before displaying printer form ([4aac393](https://github.com/teg/teg/commit/4aac393))


### Features

* Add a GCode Terminal to the Manage UI ([f2ac418](https://github.com/teg/teg/commit/f2ac418))
* Add a GraphQL Playground page to the Manage UI for developers ([cc4678f](https://github.com/teg/teg/commit/cc4678f))
* Add hasPendingUpdates Boolean! to GraphQL to introspect the update process. ([bd0d78c](https://github.com/teg/teg/commit/bd0d78c))
* Add host macros to the GCode Terminal UI and to GCodeHistoryEntry in the API ([4ba9d91](https://github.com/teg/teg/commit/4ba9d91))
* Add Teg version to config UI and GraphQL API ([f06edc8](https://github.com/teg/teg/commit/f06edc8))
* Automic configs - configuration changes are now atomically saved to disk to prevent corruption ([66efe22](https://github.com/teg/teg/commit/66efe22))
* Integrated Print Preview in the Job Queue UI ([142b036](https://github.com/teg/teg/commit/142b036))
* New GCode History API ([857dd67](https://github.com/teg/teg/commit/857dd67))
* New mobile navigation accessible for smaller screens ([bcdbb9e](https://github.com/teg/teg/commit/bcdbb9e))
* Prevent modifications to configs while printing ([83ac819](https://github.com/teg/teg/commit/83ac819))
* Replace spoolCommands to spoolGCodes ([a501808](https://github.com/teg/teg/commit/a501808))
* Top navigation redesign. Streamlined all buttons into one consistent navigation bar. ([2a7fa98](https://github.com/teg/teg/commit/2a7fa98))


### BREAKING CHANGES

* Printer.logEntries has been removed.
* Printer.temperatureHistory has been removed in favour of Heater.history





# [0.7.0](https://github.com/teg/teg/compare/v0.6.0...v0.7.0) (2019-05-07)


### Bug Fixes

* added missing viewport meta tag. Fixes responsive breakpoint issues in Chrome ([2425f63](https://github.com/teg/teg/commit/2425f63))
* make landing page copy readable on mobile ([3061e04](https://github.com/teg/teg/commit/3061e04))
* memoization null value error ([9f4c9f0](https://github.com/teg/teg/commit/9f4c9f0))
* serial port list was not being populated on Printer Settings page ([04c18bc](https://github.com/teg/teg/commit/04c18bc))
* simulated devices will no longer be displayed in the serial port list ([2a34187](https://github.com/teg/teg/commit/2a34187))


### Features

* Fresh redesign including a new getting started worflow. ([ad13b71](https://github.com/teg/teg/commit/ad13b71))
* Getting Started wizard now only prompts the user to set up their printer once on initial connection. ([ec4946a](https://github.com/teg/teg/commit/ec4946a))
* New 3D printer setup in Getting Started wizard. ([039e94b](https://github.com/teg/teg/commit/039e94b))
* The serial port dropdown now instructs the user to plug in their 3D printer instead of showing an empty list ([850b3eb](https://github.com/teg/teg/commit/850b3eb))





# [0.6.0](https://github.com/teg/teg/compare/v0.5.10...v0.6.0) (2019-04-09)


### Bug Fixes

* Add --skip-optional to all yarn install scripts ([d6f3fdc](https://github.com/teg/teg/commit/d6f3fdc))
* automatic job queue despooling create new job bugs ([ce5e645](https://github.com/teg/teg/commit/ce5e645))
* eStop should be an emergency task ([35f24a3](https://github.com/teg/teg/commit/35f24a3))
* fix jobQueueReducer tests ([e0aaad2](https://github.com/teg/teg/commit/e0aaad2))
* Fixed Delete Job button ([7bc4e16](https://github.com/teg/teg/commit/7bc4e16))
* packages/teg-web-ui/package.json to reduce vulnerabilities ([b56768a](https://github.com/teg/teg/commit/b56768a))
* position polling interval revealed a bug that could attempt to despool two lines at once. Fixed by adding a explicit despoolComplete action and corresponding checks ([4907629](https://github.com/teg/teg/commit/4907629))
* print progress is now relayed to AutoDrop correctly ([7ec9bba](https://github.com/teg/teg/commit/7ec9bba))
* raspberry pi GPIO and delay extended gcode ([60003e3](https://github.com/teg/teg/commit/60003e3))
* redux-loop Cmd.list bug was preventing autodrop jobs from being created ([3718782](https://github.com/teg/teg/commit/3718782))
* removing initial zeros entry from temperature history ([c4aec3d](https://github.com/teg/teg/commit/c4aec3d))
* typo in job queue handling of request spool job file ([19deead](https://github.com/teg/teg/commit/19deead))
* uncomment  injection ([a18ae63](https://github.com/teg/teg/commit/a18ae63))
* Updating tests ([9ac1dc4](https://github.com/teg/teg/commit/9ac1dc4))


### Features

* @tegapp/autodrop3D - an Autodrop3D plugin for Teg ([835b763](https://github.com/teg/teg/commit/835b763))
* AutoDrop 3D plugin ([d972a54](https://github.com/teg/teg/commit/d972a54))
* Automatic Printing for conveyors and auto-scrapers ([057ae50](https://github.com/teg/teg/commit/057ae50))
* Custom Dockerfile for drone builds ([bb9773c](https://github.com/teg/teg/commit/bb9773c))
* drone.io continuous build pipeline for Teg snaps ([88d5544](https://github.com/teg/teg/commit/88d5544))
* New GCode Hooks: beforePrintHook and afterPrintHook ([25835a0](https://github.com/teg/teg/commit/25835a0))
* New Job Queue and Autodrop macros: spoolNextJobFile, spoolJobFile and fetchAutodropJob ([e894fcf](https://github.com/teg/teg/commit/e894fcf))
* Now available in the snap store: https://snapcraft.io/teg ([73209bf](https://github.com/teg/teg/commit/73209bf))
* Printer temperature history can now be live queried from GraphQL ([450ef39](https://github.com/teg/teg/commit/450ef39))
