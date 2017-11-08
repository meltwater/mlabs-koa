import { defaultTo, isNotObj, pipe } from '@meltwater/phi'

import createApp from './app'
import createBootstrapper from './bootstrapper'

const startServer = ({config, log, app, healthMonitor}) => {
  const koaConfig = defaultTo({}, config.get('koa'))
  const pkg = defaultTo({}, config.get('pkg'))

  if (isNotObj(koaConfig)) {
    throw new Error(`Config key 'koa' must be object, got ${typeof logConfig}.`)
  }

  const port = pipe(
    defaultTo(80),
    parseInt
  )(config.get('port'))

  const server = createApp({log, app, healthMonitor, pkg, config: koaConfig})

  server.listen(port, () => {
    log.info(`Server: http://localhost:${port}`)
  })
}

export default createBootstrapper(startServer)
