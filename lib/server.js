import fs from 'fs'
import path from 'path'

import confit from 'confit'
import createLogger from '@meltwater/mlabs-logger'

const startServer = ({port, log, start, app}) => {
  log.info('Server: Start')
  start().then(() => {
    app.listen(port, () => {
      log.info(`Server: http://localhost:${port}`)
    })
  }).catch(err => {
    log.fatal({err}, 'Server: Fail')
    process.exit(1)
  })
}

const createConfigFactory = configPath => {
  const factory = confit({
    basedir: configPath,
    defaults: 'default.json'
  })

  return factory
}

const initialize = ({port, start, dependencies}) => {
  const log = dependencies.resolve('log')

  process.on('SIGINT', () => {
    log.info('Signal: Interrupt')
    process.exit()
  })

  process.on('SIGTERM', () => {
    log.info('Signal: Terminate')
    process.exit()
  })

  try {
    log.info('Initialize: Start')
    const app = dependencies.resolve('app')
    const start = dependencies.resolve('start')
    startServer({port, log, start, app})
  } catch (err) {
    log.fatal({err}, 'Initialize: Fail')
    process.exit(1)
  }
}

const bootstrap = createDependencies => (err, config) => {
  if (err) {
    createLogger().fatal({err}, 'Config: Fail')
    process.exit(1)
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json')))
    config.use({pkg})

    const port = config.get('port')

    const log = createLogger({
      name: config.get('pkg:name'),
      ...config.get('log')
    })

    const dependencies = createDependencies({config, log})

    initialize({port, log, dependencies})
  } catch (error) {
    createLogger().fatal({err: error}, 'Bootstrap: Fail')
    process.exit(1)
  }
}

export default ({configPath, createDependencies}) => {
  try {
    const configFactory = createConfigFactory(configPath)

    return {
      configFactory,
      run: configFactory => configFactory.create(bootstrap(createDependencies))
    }
  } catch (err) {
    createLogger().fatal({err}, 'Config: Fail')
    process.exit(1)
  }
}
