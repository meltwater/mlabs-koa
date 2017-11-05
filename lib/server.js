import createApp from './app'
import createBootstrapper from './bootstrapper'

const startServer = ({config, log, start, app}) => {
  log.info('Server: Start')
  const port = config.get('port')
  start().then(() => {
    createApp({app, config: config.get('koa')}).listen(port, () => {
      log.info(`Server: http://localhost:${port}`)
    })
  }).catch(err => {
    log.fatal({err}, 'Server: Fail')
    process.exit(1)
  })
}

export default createBootstrapper(startServer)
