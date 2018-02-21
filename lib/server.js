import Koa from 'koa'
import koaMount from 'koa-mount'
import {
  defaultTo,
  defaultWhen,
  isNilOrEmpty,
  isNotObj,
  pipe,
  propOr
} from '@meltwater/phi'

import createApp from './app'
import createBootstrapper from './bootstrapper'

const scopePerRequest = container => (ctx, next) => {
  ctx.state.container = container.createScope()
  return next()
}

const injectLog = container => (ctx, next) => {
  ctx.state.log = ctx.state.container.resolve('log')
  return next()
}

const startServer = ({
  config,
  log,
  app,
  healthMonitor,
  healthMethods,
  dependencies
}) => {
  const koaConfig = defaultTo({}, config.get('koa'))
  const pkg = defaultTo({}, config.get('pkg'))

  if (isNotObj(koaConfig)) {
    throw new Error(`Config key 'koa' must be object, got ${typeof logConfig}.`)
  }

  const port = pipe(
    defaultTo(80),
    parseInt
  )(defaultWhen(isNilOrEmpty, config.get('port'), config.get('PORT')))

  const isErrorLogged = propOr(true, 'isLogged', koaConfig.error)

  const server = new Koa()
  const middleware = createApp({
    healthMonitor,
    healthMethods,
    pkg,
    isProduction: config.get('env:production'),
    config: koaConfig
  })

  server.use(scopePerRequest(dependencies))
  server.use(injectLog(dependencies))
  server.use(koaMount(middleware))
  server.use(koaMount(app))

  if (isErrorLogged) {
    server.on('error', (err, ctx) => {
      ctx.state.container.resolve('log').error({err}, 'Request: Fail')
    })
  }

  return server.listen(port, () => {
    log.info({isLifecycle: true}, `Server: http://localhost:${port}`)
  })
}

export default createBootstrapper(startServer)
