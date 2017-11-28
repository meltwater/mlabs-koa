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

#### Arguments

1. `options` (*object*):
    - `configPath` (*string* **required**):
      Full path to the configuration directory.
    - `createDependencies` (*function* **required**):
      Function which takes a [confit] config object
      and returns an [Awilix] container.

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

[Awilix]: https://github.com/jeffijoe/awilix
[confit]: https://github.com/krakenjs/confit
