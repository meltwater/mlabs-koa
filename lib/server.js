import Koa from 'koa'
import koaMount from 'koa-mount'
import { defaultTo, isNotObj, pipe } from '@meltwater/phi'

import createApp from './app'
import createBootstrapper from './bootstrapper'

const scopePerRequest = container => (ctx, next) => {
  ctx.state.container = container.createScope()
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
  )(defaultTo(config.get('port'), config.get('PORT')))

  const server = new Koa()
  const middleware = createApp({
    log,
    healthMonitor,
    healthMethods,
    pkg,
    config: koaConfig
  })

  server.use(scopePerRequest(dependencies))
  server.use(koaMount(middleware))
  server.use(koaMount(app))

  server.listen(port, () => {
    log.info(`Server: http://localhost:${port}`)
  })
}

export default createBootstrapper(startServer)
