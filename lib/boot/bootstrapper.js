import { createContainer } from 'awilix'
import chokidar from 'chokidar'
import { isNotString } from '@meltwater/phi'
import createLogger from '@meltwater/mlabs-logger'

import initialize from './init'
import createConfigFactory from './config'
import getLoggerOptions from './logger'

const isLifeCycleLog = true

const createBootstrap = ({
  createDependencies,
  startServer,
  logFilters,
  watcher
}) => (err, config) => {
  if (err) {
    createLogger().fatal({ err, isLifeCycleLog }, 'Config: Fail')
    process.exit(1)
  }

  try {
    const logOptions = getLoggerOptions({ config, logFilters })
    const log = createLogger(logOptions)
    const dependencies = createDependencies({ config, log })
    initialize({ config, dependencies, startServer, watcher, logger: log })
  } catch (error) {
    createLogger().fatal({ isLifeCycleLog, err: error }, 'Bootstrap: Fail')
    process.exit(1)
  }
}

export default (
  startServer
) => ({
  configPath = process.cwd(),
  createDependencies = createContainer,
  logFilters
} = {}) => {
  try {
    if (isNotString(configPath)) {
      throw new Error(`Config path must be string, got ${typeof configPath}.`)
    }

    const watcher = chokidar.watch(configPath, { ignoreInitial: true })
    watcher.on('error', err => {
      createLogger().fatal({ err, isLifeCycleLog }, 'Watcher: Error')
      process.exit(1)
    }).on('all', () => {
      createLogger().fatal({ isLifeCycleLog }, 'Config: Changed')
      process.exit(1)
    })

    const configFactory = createConfigFactory(configPath)
    const bootstrap = createBootstrap({
      createDependencies,
      startServer,
      logFilters,
      watcher
    })

    const exit = err => {
      createLogger().fatal({ err, isLifeCycleLog }, 'Exit')
      process.exit(err ? 2 : 0)
    }

    return {
      exit,
      configFactory,
      run: configFactory => configFactory.create(bootstrap)
    }
  } catch (err) {
    createLogger().fatal({ err, isLifeCycleLog }, 'Config: Fail')
    process.exit(1)
  }
}
