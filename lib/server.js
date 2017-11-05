import createApp from './app'
import createBootstrapper from './bootstrapper'

const startServer = ({config, log, start, app}) => {
  const koaConfig = config.get('koa')
  const port = parseInt(config.get('port') || 80)
  createApp({app, config: koaConfig}).listen(port, () => {
    log.info(`Server: http://localhost:${port}`)
  })
}

export default createBootstrapper(startServer)
