import { defaultTo, isNil, pipe, unless } from '@meltwater/phi'

import createApp from './app'
import createBootstrapper from './bootstrapper'

const startServer = ({config, log, app, healthMonitor}) => {
  const koaConfig = config.get('koa')
  const port = pipe(
    defaultTo(80),
    unless(isNil, parseInt)
  )(config.get('port'))

  const server = createApp({log, app, healthMonitor, config: koaConfig})

  server.listen(port, () => {
    log.info(`Server: http://localhost:${port}`)
  })
}

export default createBootstrapper(startServer)
