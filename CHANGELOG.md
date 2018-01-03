# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [1.4.1] / 2018-01-03

## Changed

- Update to [makenew-node-lib] v4.1.9.
- Update chokidar to version 2.

## [1.4.0] / 2017-12-14

## Changed

- Do not load hidden files (dotfiles) as secrets of configs.

## [1.3.1] / 2017-12-14

## Fixed

- Watching recursive config paths on Linux.

## [1.3.0] / 2017-12-14

### Added

- Override log level with `LOG_LEVEL`.

## [1.2.0] / 2017-12-13

### Added

- Load all config files under `env.d` and `local.d`.
- Load contents of files under `secret.d` into config.

## [1.1.0] / 2017-12-12

### Added

- All lifecycle logs messages set `isLifecycle: true`.

### Changed

- Update to [makenew-node-lib] v4.1.8.

## 1.0.0 / 2017-12-11

- Initial release.

[makenew-node-lib]: https://github.com/meltwater/makenew-node-lib

[Unreleased]: https://github.com/meltwater/mlabs-koa/compare/v1.4.1...HEAD
[1.4.1]: https://github.com/meltwater/mlabs-koa/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/meltwater/mlabs-koa/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/meltwater/mlabs-koa/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/meltwater/mlabs-koa/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/meltwater/mlabs-koa/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/meltwater/mlabs-koa/compare/v1.0.0...v1.1.0
