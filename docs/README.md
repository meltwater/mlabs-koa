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
Creates a [Logger], mounts the app with all enabled middleware,
and controls process lifecycle.
An [Awilix] container will be scoped for each request
under `ctx.state.container`.

#### Arguments

1. `options` (*object*):
    - `configPath` (*string* **required**):
      Full path to the configuration directory.
      See [Middleware and Config](#config-and-middleware) below.
    - `createDependencies` (*function* **required**):
      Function which takes an object `{config, log}`
      (a [Logger] and a [confit] config object)
      and returns an [Awilix] container.
      See [Dependencies](#dependencies) below.

#### Returns

(*object*):
  - `configFactory` (*object*):
    The [confit] config factory.
  - `run` (*function*):
    Takes a single argument, the confit config factory,
    and starts the Koa server.

#### Example

```js
const { configFactory, run } = createServer({
  configPath: path.resolve(__dirname, 'config'),
  createDependencies
})

run(configFactory)
```

---
### `koaHealthy(options)`

Standalone middleware that always sets either a 200 or 503 status code.
If the request accepts JSON, it will set the body to either
`{"healthy": true}` or `{"healthy": false}`.

This middleware is not mounted anywhere by default,
it is meant to be used for an API health endpoint.

#### Arguments

1. `options` (*object*):
    - `isHealthy` (*boolean*):
      If the middleware will set 200 or 503 status.
      Default: true.

#### Returns

(*function*): The middleware.

## Dependencies

The `createDependencies` function will be passed an object with
`log` (a [Logger]) and `config` (a [confit] config object).
Use `config.get('a:b:c')` to pass configuration to dependencies.

The following dependencies must be registered in `createDependencies`:

- `log`: A [Logger] instance.
- `healthMonitor`: A [Health Monitor].
  Each health check will be called with the [Awilix] container.
- `healthMethods`: Health methods to determine health status
  for each health endpoint.
  See [createHealthy].
  The `health` key must be provided and will be used by default
  for any unspecified health checks.
- `start`: Async function to wait on before server startup:
  called before server has started accepting new connections.
- `stop`: Async function to wait on before server shutdown:
  called after server has stopped accepting new connections.
- `app`: The Koa app to mount.

A minimal example (taken from [`server.js`](../examples/server.js)) looks like

```js
import { createContainer, asValue, asFunction } from 'awilix'

const createDependencies = ({log, config}) => {
  const container = createContainer()

  container.register({
    log: asValue(log),
    healthMethods: asValue({health: createHealthy()}),
    healthMonitor: asFunction(createHealthMonitor).singleton(),
    start: asFunction(createStart).singleton(),
    stop: asFunction(createStop).singleton(),
    app: asFunction(createApp).singleton()
  })

  return container
}
```

## Config and Middleware

_Middleware behavior is defined below along with it's configuration._

The `configPath` must point to a path containing a set of [confit] config files.

Since the config factory is returned before the server starts up,
more files may be loaded and the configuration may be modified
before passing it to `run`.

In addition to the standard behavior of [confit],
the following is true:

- The default config file is named `default.json` (not `config.json`).
- If `env.json` exists it will be loaded as an override file.
- If `local.json` exists it will be loaded as the final override file.
- The key `config` will contain the `configPath`.
- The key `pkg` will contain the contents of `package.json` from the
  current working directory.

### Config options

All configuration options have sensible defaults
so no config options are required.

#### `port`

The port number to run the server on.
Override with `PORT`.
Default is `80`.

#### `log`

Object passed directly to the [Logger] `createLogger` function.
The following additional properties will be added if defined:

- `env`: Adds `@env` to logs (override with `LOG_ENV`).
- `service`: Adds `@service` to logs (override with `LOG_SERVICE`).
  Default: automatically determined from the package name.
- `system`: Adds `@system` to logs (override with `LOG_SYSTEM`).
  Default: automatically determined from the package name.

#### `koa`

Koa middleware configuration object:
each property is passed to the corresponding middleware.

All Middleware configuration takes an additional boolean
property `disable` which may be set to skip loading the middleware.
Third party middleware configuration is documented on
the corresponding project:
see the [links in the README](../README.md#middleware).
Custom middleware configuration is documented below.

---
##### `dependencyInjection`

_The [Awilix] container is scoped per request
independently of this middleware under `ctx.state.container`._

For each request, registers `log` and `reqId` in the scoped container.
Also sets `ctx.state.log` and `ctx.state.reqId`.

---
##### `error`

- `isServerErrorExposed`: Expose server errors (5xx status codes)
  to client in response body.
  Default: true.

_All errors are logged independently of this middleware._

Catches and wrap all errors as [Boom] errors.
Errors are sent as a response in the standard format:

```json
{
  "error": "Internal Server Error",
  "message": "On fire!",
  "data": {"isOnFire": true},
  "status": 500,
  "statusCode": 500
}
```

Additional data passed to Boom errors is set under `error.data`.

---
##### `status`

- `path`: Path to serve status.
  Default: `/status`

Serve `health` monitor status at `GET /status`
and individual health monitor status at `GET /status/:name`.

The status is retrieved from `healthMonitor[name].status()`.

---
##### `health`

- `path`: Path to serve health.
  Default: `/health`

Serve `health` healthy status at `GET /health`
and individual healthy status at `GET /health/:name`.

The boolean health status is computed
from `healthMethods[name](healthMonitor[name].status())`.

---
##### `root`

- `data`: JSON object to serve.

Serves a JSON document at `GET /`.

---
##### `robots`

- `rules`: Object containing named rules.
  Each property should be an array of strings,
  each of which will appear on it's own line in `robots.txt`.
  Default: set of predefined rules.
- `rule`: Name of the rule to use from `rules`.
  Default: `disallow`.

Serves `GET /robots.txt`.
Includes the rules `allow` and `disallow`.
Disallows all by default.

---
##### `requestId`

- `reqHeader`: Request header to use for the request id.
  Default: `x-request-id`.
- `resHeader`: Response header to use for the request id.
  Default: `x-request-id`.
- `paramName`: Request id will be stored or looked for in `ctx.state[paramName]`.
  Default: `id`.
- `generator`: Synchronous function to generate new ids.
  Default: UUID version 4.

Looks for a request id in the state or request header,
otherwise generates a new one to save in the state.
Passes the request id along in the response headers.

---
##### `favicon`

Takes configuration for [koa-favicon](https://github.com/koajs/favicon)
with the additional property `path` which should be the full path
to the favicon file.

### Example

A full example of a config file is given below.

Configuration for third party middleware,
[listed in the README](../README.md#middleware),
is passed through unmodified
and is not documented here:
refer to the linked upstream documentation.

These values are not necessarily the defaults.

```json
{
  "port": 80,
  "log": {
    "level": "info",
    "env": "space",
    "service": "laser",
    "system": "deathstar"
  },
  "koa": {
    "dependencyInjection": {
      "requestIdParamName": "id",
      "disable": false
    },
    "error": {
      "isServerErrorExposed": true,
      "disable": false
    },
    "health": {
      "path": "/health",
      "disable": false
    },
    "status": {
      "path": "/status",
      "disable": false
    },
    "root": {
      "data": {},
      "disable": false
    },
    "robots": {
      "rule": "disallow",
      "rules": {
        "disallow": ["User-agent: *", "Disallow: /"]
      },
      "disable": false
    },
    "requestId": {
      "reqHeader": "x-request-id",
      "resHeader": "x-request-id",
      "paramName": "id",
      "disable": false
    },
    "favicon": {
      "path": "/path/to/favicon.ico",
      "disable": false
    },
    "conditionalGet": {
      "disable": false
    },
    "cors": {
      "disable": false
    },
    "etag": {
      "disable": false
    },
    "helmet": {
      "disable": false
    },
    "logger": {
      "disable": false
    }
  }
}
```

[Awilix]: https://github.com/jeffijoe/awilix
[Boom]: https://github.com/hapijs/boom
[confit]: https://github.com/krakenjs/confit
[Logger]:  https://github.com/meltwater/mlabs-logger
[Health Monitor]: https://github.com/meltwater/mlabs-health/tree/master/docs#createhealthmonitortargets-options
[createHealthy]: https://github.com/meltwater/mlabs-health/tree/master/docs#createhealthyoptions
