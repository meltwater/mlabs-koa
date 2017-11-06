import createApp from './app'
import createBootstrapper from './bootstrapper'

const startServer = ({config, log, app, healthMonitor}) => {
  const koaConfig = config.get('koa')
  const port = parseInt(config.get('port') || 80)
  const server = createApp({log, app, healthMonitor, config: koaConfig})
  server.listen(port, () => {
    log.info(`Server: http://localhost:${port}`)
  })
}

export default createBootstrapper(startServer)
