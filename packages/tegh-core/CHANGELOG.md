# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
