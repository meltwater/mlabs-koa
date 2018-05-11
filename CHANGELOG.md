# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [3.0.0] / 2018-05-11

### Added

- Readiness middleware to track if server is ready to handle requests.
- Option to delay shutdown for `shutdownDelay` milliseconds.

### Changed

- Server will not shutdown on config change: instead it will fail readiness check.
- Koa server starts before registered `start` function is called.

### Fixed

- `koaHealthy` responded with JSON instead of plain text when
  requests do not send accept header.

## [2.3.0] / 2018-04-13

### Added

- Serve Prometheus metrics at `/metrics` by
  adding a `registry` to dependencies.

## [2.2.0] / 2018-04-03

### Changed

- Handle errors on server listen by logging and shutting down.

## [2.1.2] / 2018-03-29

### Changed

- Update to koa-helmet v4.
- Update to mlabs-logger v4.1.1.
- Update to [makenew-node-lib] v4.6.1.

## [2.1.1] / 2018-02-27

### Changed

- Update to @meltwater/phi v2.
- Update to [makenew-node-lib] v4.5.0.

## [2.1.0] / 2018-02-25

### Changed

- Use default config value when environment variable is empty string.
- Update to [makenew-node-lib] v4.4.1.

### Fixed

- Case where log `outputMode` would be ignored.

## [2.0.0] / 2018-02-02

### Added

- Filter logs in development with new options `logFilters` and `filter`.
- Select `logOutputMode`in development.
- Corresponding overrides for the above with `LOG_OUTPUT_MODE` and `LOG_FILTER`.
- Ability to override log `version` property.
- Convenience method `httpGetJson`.

### Changed

- Update to mlabs-logger version 4 which now uses Pino.
- Default logger properties must be under the `base` option.
  The base option will be merged with the standard Pino base defaults.
- (**Breaking**) Logs are now formatted in development according to log `outputMode`.
  No need to pipe logs through an external CLI formatter.
- (**Breaking**) Remove `useProduction` logger option and replace with `useDev` and `addReq`.
- Update to [makenew-node-lib] v4.3.4.

## [1.7.0] / 2018-01-25

### Changed

- If `ctx.body` is set and an error is thrown
  (either directly or via `ctx.status`),
  the body will be respected and sent unmodified
  instead of sending the standard error payload.

### Fixed

- Throw a corresponding Boom error when `ctx.status` is set.
  Previously only a 404 status would throw a proper error.

## [1.6.1] / 2018-01-18

### Changed

- Update to [makenew-node-lib] v4.1.12.

## [1.6.0] / 2018-01-18

### Added

- Log `reqName` from `x-request-name` header.
- Log `statusCode` under `http` property.

### Changed

- Update to [makenew-node-lib] v4.1.11.

## [1.5.0] / 2018-01-10

### Added

- `createServer` now returns `exit` function.

### Changed

- Update to [makenew-node-lib] v4.1.10.

## [1.4.1] / 2018-01-03

### Changed

- Update to [makenew-node-lib] v4.1.9.
- Update chokidar to version 2.

## [1.4.0] / 2017-12-14

### Changed

- Do not load hidden files (dotfiles) as secrets of configs.

## [1.3.1] / 2017-12-14

### Fixed

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

[Unreleased]: https://github.com/meltwater/mlabs-koa/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/meltwater/mlabs-koa/compare/v2.3.0...v3.0.0
[2.3.0]: https://github.com/meltwater/mlabs-koa/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/meltwater/mlabs-koa/compare/v2.1.2...v2.2.0
[2.1.2]: https://github.com/meltwater/mlabs-koa/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/meltwater/mlabs-koa/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/meltwater/mlabs-koa/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/meltwater/mlabs-koa/compare/v1.7.0...v2.0.0
[1.7.0]: https://github.com/meltwater/mlabs-koa/compare/v1.6.1...v1.7.0
[1.6.1]: https://github.com/meltwater/mlabs-koa/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/meltwater/mlabs-koa/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/meltwater/mlabs-koa/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/meltwater/mlabs-koa/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/meltwater/mlabs-koa/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/meltwater/mlabs-koa/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/meltwater/mlabs-koa/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/meltwater/mlabs-koa/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/meltwater/mlabs-koa/compare/v1.0.0...v1.1.0
