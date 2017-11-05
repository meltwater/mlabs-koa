import fs from 'fs'
import path from 'path'

import confit from 'confit'
import createLogger from '@meltwater/mlabs-logger'

const createConfigFactory = configPath => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json')))

  const factory = confit({
    basedir: configPath,
    defaults: 'default.json'
  })

  factory.addOverride({pkg})

  return factory
}

const initialize = ({config, dependencies, startServer}) => {
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
    startServer({config, log, start, app})
  } catch (err) {
    log.fatal({err}, 'Initialize: Fail')
    process.exit(1)
  }
}

const createBootstrap = (createDependencies, startServer) => (err, config) => {
  if (err) {
    createLogger().fatal({err}, 'Config: Fail')
    process.exit(1)
  }

  try {
    const name = config.get('pkg:name')
    const logConfig = config.get('log') || {}
    const log = createLogger({name, ...logConfig})

    const dependencies = createDependencies({config, log})

    initialize({config, log, dependencies, startServer})
  } catch (error) {
    createLogger().fatal({err: error}, 'Bootstrap: Fail')
    process.exit(1)
  }
}

export default (
  startServer
) => ({
  configPath,
  createDependencies
}) => {
  try {
    const configFactory = createConfigFactory(configPath)
    const bootstrap = createBootstrap(createDependencies, startServer)

    return {
      configFactory,
      run: configFactory => configFactory.create(bootstrap)
    }
  } catch (err) {
    createLogger().fatal({err}, 'Config: Fail')
    process.exit(1)
  }
}
