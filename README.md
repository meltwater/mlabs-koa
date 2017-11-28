# Koa Middleware

[![npm](https://img.shields.io/badge/npm-%40meltwater%2Fmlabs--koa-blue.svg)](https://www.npmjs.com/package/@meltwater/mlabs-koa)
[![github](https://img.shields.io/badge/github-repo-blue.svg)](https://github.com/meltwater/mlabs-koa)
[![docs](https://img.shields.io/badge/docs-master-green.svg)](https://github.com/meltwater/mlabs-koa/tree/master/docs)
[![Codecov](https://img.shields.io/codecov/c/token/B7mRavvAbu/github/meltwater/mlabs-koa.svg)](https://codecov.io/gh/meltwater/mlabs-koa)
[![CircleCI](https://circleci.com/gh/meltwater/mlabs-koa.svg?style=shield&circle-token=9bf640753b5b12586fc1c427fe280b8c85e48e2f)](https://circleci.com/gh/meltwater/mlabs-koa)

## Description

Koa middleware suite and server bootstrapper.

Wires up configuration to dependencies and creates
a production ready Koa server will a full middleware stack.

Uses [confit] for configuration and [Awilix] for dependency injection.

[Awilix]: https://github.com/jeffijoe/awilix
[confit]: https://github.com/krakenjs/confit

### Middleware

All middleware is enabled by default
but may be disabled or configured as needed.

- [`conditionalGet`]: Conditional GET support.
- [`cors`]: Enable CORS.
- `dependencyInjection`: Inject scoped `reqId` and `log` for each request.
- `error`: Error handling with [Boom].
- [`etag`]: Add ETag to response.
- [`favicon`]: Serve a default favicon.
- [`helmet`]: Security middleware.
- [`logger`]: Log all requests.
- `requestId`: Read `x-request-id` header and add to `ctx.state`.
- `health`: Check health and serve status at `/health`.
- `status`: Serve health status at `/status`.
- `root`: Serve `package.json` at `/`.
- `robots`: Serve `/robots.txt`.

[`conditionalGet`]: https://github.com/koajs/conditional-get
[`cors`]: https://github.com/koajs/cors
[`etag`]: https://github.com/koajs/etag
[`favicon`]: https://github.com/koajs/favicon
[`helmet`]: https://github.com/venables/koa-helmet
[`logger`]: https://github.com/koajs/logger
[Boom]: https://github.com/hapijs/boom

## Installation

Add this and its peer dependencies as dependencies to your project using [npm] with

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

Assuming `createDependencies` is provided
by your application along with a config folder,
bootstrap a server with

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

The specification for `createDependencies` and valid configuration files
is described in the [API documentation](./docs).

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
$ yarn run watch:test
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

These may be set manually or by running the script `./circleci/envvars.sh`.

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

_Update the CHANGELOG before each new release._

Release a new version using [`npm version`][npm version].
This will run all tests, update the version number,
create and push a tagged commit,
and trigger CircleCI to publish the new version to npm.

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
$ yarn run gulp -- --tasks
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

[gulp]: http://gulpjs.com/
[JavaScript Standard Style]: http://standardjs.com/
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
$ yarn run watch:test
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
$ yarn run ava:inspect lib/true.spec.js
```

Watch and restart the debugging session on changes with

```
$ yarn run ava:inspect:watch lib/true.spec.js
```

[AVA]: https://github.com/avajs/ava
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

This npm package is Copyright (c) 2016-2017 Meltwater Group.

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
