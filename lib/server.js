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

import createApp from './app.js'
import createBootstrapper from './boot/index.js'
import { logAndExit } from './boot/logger.js'

const scopePerRequest = (container) => (ctx, next) => {
  ctx.state.container = container.createScope()
  return next()
}

const injectLog = (container) => (ctx, next) => {
  ctx.state.log = ctx.state.container.resolve('log')
  return next()
}

const startServer = ({
  config,
  log,
  app,
  healthMonitor,
  healthMethods,
  registry,
  status,
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
  const updateHealthStatus = (isHealthy) => {
    isHealthy ? status.emit('healthy') : status.emit('unhealthy')
  }

  const server = new Koa()
  const middleware = createApp({
    healthMonitor,
    healthMethods,
    registry,
    pkg,
    updateHealthStatus,
    getReadyStatus: () => status.isReady(),
    isProduction: config.get('env:production'),
    config: koaConfig
  })

  server.use(scopePerRequest(dependencies))
  server.use(injectLog(dependencies))
  server.use(koaMount(middleware))
  server.use(koaMount(app))

  if (isErrorLogged) {
    server.on('error', (err, ctx) => {
      const logProps = { isRequestLog: true, isAppLog: false }
      ctx.state.container
        .resolve('log')
        .error({ err, ...logProps }, 'Request: Fail')
    })
  }

  const lifeLog = log.child({ isLifeCycleLog: true, isAppLog: false })
  return server
    .listen(port, () => {
      lifeLog.info(`Server: http://localhost:${port}`)
      status.emit('listen')
    })
    .on('error', logAndExit({ msg: 'Server: Fail', log }))
}

export default createBootstrapper(startServer)
