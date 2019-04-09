# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.6.0](https://github.com/tegh/tegh/compare/v0.5.10...v0.6.0) (2019-04-09)


### Bug Fixes

* position polling interval revealed a bug that could attempt to despool two lines at once. Fixed by adding a explicit despoolComplete action and corresponding checks ([4907629](https://github.com/tegh/tegh/commit/4907629))
* removing initial zeros entry from temperature history ([c4aec3d](https://github.com/tegh/tegh/commit/c4aec3d))
* Updating tests ([9ac1dc4](https://github.com/tegh/tegh/commit/9ac1dc4))


### Features

* Printer temperature history can now be live queried from GraphQL ([450ef39](https://github.com/tegh/tegh/commit/450ef39))
