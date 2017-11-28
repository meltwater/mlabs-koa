# API Reference

## Top-Level Exports

- [`createServer(options)`](#createserveroptions)
- [`koaHealthy(options)`](#koahealthyoptions)

### Importing

Every function described above is a top-level export.
You can import any of them like this:

```js
import { createServer } from '@meltwater/mlabs-koa'
```

---
### `createServer(options)`

Provide configuration and dependencies to run the Koa server.

#### Arguments

1. `options` (*object*):
    - `configPath` (*string* **required**):
      Full path to the configuration directory.
      See [Config](#Config) below.
    - `createDependencies` (*function* **required**):
      Function which takes a [confit] config object
      and returns an [Awilix] container.
      See [Dependencies](#Dependencies) below.

#### Returns

(*object*):
  - `configFactory` (*object*):
    The [confit] config factory.
  - `run` (*function*):
    Takes a single argument, the confit config factory,
    and starts the Koa server

---
### `koaHealthy(options)`

Middleware that always sets either a 200 or 503 status code.
If the request accepts JSON, it will set the body to either
`{"healthy": true}` or `{"healthy": false}`.

#### Arguments

1. `options` (*object*):
    - `isHealthy` (*boolean*):
      If the middleware will set 200 or 503 status.
      Default: true.

#### Returns

(*function*): The middleware.

## Dependencies

The `createDependencies` function will be passed an object with
`log` and `config`.

The following dependencies must be registered in `createDependencies`:

  - `log`: A [Logger] instance.
  - `healthMonitor`: A [Health Monitor].
    Each health check will be called with the [Awilix] container.
  - `healthMethods`: Health methods to determine health status
    for each health endpoint.
    See [createHealthy].
    The `health` key must be provided and will be used by default
    for any unspecified health checks.
  - `start`: Async function called before server startup.
  - `stop`: Async function called on server shutdown.
  - `app`: The Koa app to mount.

A minimal example would look like

```js
const createDependencies = ({log, config}) => {
  const container = createContainer()

  container.register({
    log: asValue(log),
    healthMethods: asValue({health: createHealthy()}),
    start: asFunction(createStart).singleton(),
    stop: asFunction(createStop).singleton(),
    app: asFunction(createApp).singleton()
  })

  container.register({
    healthMonitor: asFunction(createHealthMonitor).singleton()
  })

  return container
}
```

## Config

The `configPath` must point to a path containing a set of [config] config files.

Since the config factory is returned before the server starts up,
more files may be loaded and the configuration may be modified
before passing it to `run`.

In addition to the standard behavior of [confit],
the following is true:

- The default config file is named `default.json` (not `config.json`).
- If `local.json` exists it will be loaded as the final override file.
- The key `config` will contain the `configPath`.
- The key `pkg` will contain the contents of `package.json` from the
  current working directory.

### Config options

All configuration options have sensible defaults
so no config options are required.

#### `port`

The port to run the server on.
Override with `PORT`.

#### `log`

Passed to the [Logger] `createLogger` function.
The following additional properties will be added if defined:

- `env` (override with `LOG_ENV`).
- `service` (override with `LOG_SERVICE`).
- `system` (override with `LOG_SYSTEM`).

#### `koa`

Middleware configuration object:
each property is passed to the corresponding middleware.

All Middleware configuration takes an additional boolean
property `disable` which may be set to skip loading the middleware.

Third party middleware is configured as documented on
the corresponding project:
see the [links in the README](../README.md#Middleware).

Custom middleware configuration is documented below.

##### `dependencyInjection`

TODO

##### `error`

TODO

##### `health`

TODO

##### `status`

TODO

##### `root`

TODO

##### `robots`

TODO

[Awilix]: https://github.com/jeffijoe/awilix
[confit]: https://github.com/krakenjs/confit
[Logger]:  https://github.com/meltwater/mlabs-logger
[Health Monitor]: https://github.com/meltwater/mlabs-health/tree/master/docs#createhealthmonitortargets-options
[createHealthy]: https://github.com/meltwater/mlabs-health/tree/master/docs#createhealthyoptions
