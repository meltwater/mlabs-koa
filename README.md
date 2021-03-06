# Koa Middleware

[![npm](https://img.shields.io/npm/v/@meltwater/mlabs-koa.svg)](https://www.npmjs.com/package/@meltwater/mlabs-koa)
[![github](https://img.shields.io/badge/github-repo-blue.svg)](https://github.com/meltwater/mlabs-koa)
[![docs](https://img.shields.io/badge/docs-master-green.svg)](https://github.com/meltwater/mlabs-koa/tree/master/docs)
[![Codecov](https://img.shields.io/codecov/c/github/meltwater/mlabs-koa.svg)](https://codecov.io/gh/meltwater/mlabs-koa)
[![CircleCI](https://img.shields.io/circleci/project/github/meltwater/mlabs-koa.svg)](https://circleci.com/gh/meltwater/mlabs-koa)

Koa middleware suite and server bootstrapper.

## Description

Wires up configuration to dependencies and creates
a production ready Koa server will a full middleware stack.
Uses [confit] for configuration and [Awilix] for dependency injection.

Koa applications built with this package focus on business logic, not boilerplate:
simply provide a set of dependencies, their configuration, and the Koa routes
for handling requests.

A minimal example is provided in [`server.js`](./examples/server.js).

[Awilix]: https://github.com/jeffijoe/awilix
[confit]: https://github.com/krakenjs/confit

### Middleware

All middleware is enabled by default,
but may be disabled or configured as needed:
see [Config and Middleware](./docs#config-and-middleware)
for full middleware documentation.

Additionally,
a [standalone healthy middleware](./docs#koahealthyoptions) is provided
for API health endpoints.

The default middleware stack includes custom middleware
and third party middleware (explicitly linked below).

- `responseTime`: Set `x-response-time` header.
- `requestId`: Pass along `x-request-id` header.
- `logger`: Log all requests and inject a scoped logger into context.
  (Uses [koa-logger] in development).
- `error`: Error handling with [Boom].
- `dependencyInjection`: Register scoped `reqId` and `log` for each request.
- [`helmet`]: Security middleware.
- [`cors`]: Enable CORS.
- [`conditionalGet`]: Conditional GET support.
- [`etag`]: Add ETag to response.
- [`favicon`]: Serve a default favicon.
- `metrics`: Serve [Prometheus] metrics.
- `robots`: Serve `/robots.txt`.
- `ping`: Serve liveliness check at `/ping`.
- `ready`: Serve readiness check at `/ready`.
- `health`: Check health at `/health`.
- `status`: Serve health status at `/status`.
- `root`: Serve `package.json` at `/`.

[`conditionalGet`]: https://github.com/koajs/conditional-get
[`cors`]: https://github.com/koajs/cors
[`etag`]: https://github.com/koajs/etag
[`favicon`]: https://github.com/koajs/favicon
[`helmet`]: https://github.com/venables/koa-helmet
[Boom]: https://github.com/hapijs/boom
[koa-logger]: https://github.com/koajs/logger
[Prometheus]: https://prometheus.io/

## Installation

Add this as a dependency to your project using [npm] with

```
$ npm install awilix koa @meltwater/mlabs-koa
```

or using [Yarn] with

```
$ yarn add awilix koa @meltwater/mlabs-koa
```

[npm]: https://www.npmjs.com/
[Yarn]: https://yarnpkg.com/

## Usage

**See the complete [API documentation](./docs) and [working examples](./examples).**

Bootstrap and start a server.

This assumes `createDependencies` is provided
by your application along with a config folder
The specification for `createDependencies` and valid configuration files
is described in the [API documentation](./docs).
A full example is provided in [`server.js`](./examples/server.js).

```js
import path from 'path'

import createServer from '@meltwater/mlabs-koa'
import { createDependencies } from '../lib'

if (require.main === module) {
  const configPath = path.resolve(__dirname, 'config')
  const { configFactory, run } = createServer({configPath, createDependencies})
  run(configFactory)
}
```

## Development Quickstart

```
$ git clone https://github.com/meltwater/mlabs-koa.git
$ cd mlabs-koa
$ nvm install
$ yarn
```

Run each command below in a separate terminal window:

```
$ yarn run watch
$ yarn run test:watch
```

## Development and Testing

### Source code

The [mlabs-koa source] is hosted on GitHub.
Clone the project with

```
$ git clone git@github.com:meltwater/mlabs-koa.git
```

[mlabs-koa source]: https://github.com/meltwater/mlabs-koa

### Requirements

You will need [Node.js] with [npm], [Yarn],
and a [Node.js debugging] client.

Be sure that all commands run under the correct Node version, e.g.,
if using [nvm], install the correct version with

```
$ nvm install
```

Set the active version for each shell session with

```
$ nvm use
```

Install the development dependencies with

```
$ yarn
```

[Node.js]: https://nodejs.org/
[Node.js debugging]: https://nodejs.org/en/docs/guides/debugging-getting-started/
[npm]: https://www.npmjs.com/
[nvm]: https://github.com/creationix/nvm

#### CircleCI

_CircleCI should already be configured: this section is for reference only._

The following environment variables must be set on [CircleCI]:

- `NPM_TOKEN`: npm token for installing and publishing packages.
- `NPM_TEAM`: npm team to grant read-only package access
  (format `org:team`, optional).
- `CODECOV_TOKEN`: Codecov token for uploading coverage reports (optional).

These may be set manually or by running the script `./.circleci/envvars.sh`.

[CircleCI]: https://circleci.com/

### Development tasks

Primary development tasks are defined under `scripts` in `package.json`
and available via `yarn run`.
View them with

```
$ yarn run
```

#### Production build

Lint, test, and transpile the production build to `dist` with

```
$ yarn run dist
```

##### Publishing a new release

Release a new version using [`npm version`][npm version].
This will run all tests, update the version number,
create and push a tagged commit,
and trigger CircleCI to publish the new version to npm.

- **Update the CHANGELOG before each new release after version 1.**
- New versions are released when the commit message is a valid version number.
- Versions are only published on release branches:
  `master` branch or any branch matching `ver/*`.
- If branch protection options are enabled,
  you must first run `npm version` on a separate branch,
  wait for the commit to pass any required checks,
  then merge and push the changes to a release branch.
- **Do not use the GitHub pull request button to merge version commits**
  as the commit tagged with the new version number will not match after merging.

[npm version]: https://docs.npmjs.com/cli/version

#### Examples

**See the [full documentation on using examples](./examples).**

View all examples with

```
$ yarn run example
```

#### Linting

Linting against the [JavaScript Standard Style] and [JSON Lint]
is handled by [gulp].

View available commands with

```
$ yarn run gulp --tasks
```

Run all linters with

```
$ yarn run lint
```

In a separate window, use gulp to watch for changes
and lint JavaScript and JSON files with

```
$ yarn run watch
```

Automatically fix most JavaScript formatting errors with

```
$ yarn run format
```

[gulp]: https://gulpjs.com/
[JavaScript Standard Style]: https://standardjs.com/
[JSON Lint]: https://github.com/zaach/jsonlint

#### Tests

Unit and integration testing is handled by [AVA]
and coverage is reported by [Istanbul] and uploaded to [Codecov].

- Test files end in `.spec.js`.
- Unit tests are placed under `lib` alongside the tested module.
- Integration tests are placed in `test`.
- Static files used in tests are placed in `fixtures`.

Watch and run tests on changes with

```
$ yarn run test:watch
```

If using [AVA snapshot testing], update snapshots with

```
$ yarn run test:update
```

Generate a coverage report with

```
$ yarn run report
```

An HTML version will be saved in `coverage`.

##### Debugging tests

Create a breakpoint by adding the statement `debugger` to the test
and start a debug session with, e.g.,

```
$ yarn run test:inspect lib/middleware/error.spec.js
```

Watch and restart the debugging session on changes with

```
$ yarn run test:inspect:watch lib/middleware/error.spec.js
```

[AVA]: https://github.com/avajs/ava
[AVA snapshot testing]: https://github.com/avajs/ava#snapshot-testing
[Codecov]: https://codecov.io/
[Istanbul]: https://istanbul.js.org/

## Contributing

The author and active contributors may be found in `package.json`,

```
$ jq .author < package.json
$ jq .contributors < package.json
```

To submit a patch:

1. Request repository access by submitting a new issue.
2. Create your feature branch (`git checkout -b my-new-feature`).
3. Make changes and write tests.
4. Commit your changes (`git commit -am 'Add some feature'`).
5. Push to the branch (`git push origin my-new-feature`).
6. Create a new Pull Request.

## License

This npm package is licensed under the MIT license.

## Warranty

This software is provided by the copyright holders and contributors "as is" and
any express or implied warranties, including, but not limited to, the implied
warranties of merchantability and fitness for a particular purpose are
disclaimed. In no event shall the copyright holder or contributors be liable for
any direct, indirect, incidental, special, exemplary, or consequential damages
(including, but not limited to, procurement of substitute goods or services;
loss of use, data, or profits; or business interruption) however caused and on
any theory of liability, whether in contract, strict liability, or tort
(including negligence or otherwise) arising in any way out of the use of this
software, even if advised of the possibility of such damage.
