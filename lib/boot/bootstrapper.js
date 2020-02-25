import { createContainer } from 'awilix'
import chokidar from 'chokidar'
import { isNotString } from '@meltwater/phi'
import createLogger from '@meltwater/mlabs-logger'

import initialize from './init'
import createConfigFactory from './config'
import getLoggerOptions, { logAndExit } from './logger'

const createBootstrap = ({
  createDependencies,
  startServer,
  logFilters,
  watcher
}) => (err, config) => {
  if (err) logAndExit({ msg: 'Config: Fail' })(err)

  try {
    const logOptions = getLoggerOptions({ config, logFilters })
    const log = createLogger(logOptions)
    const dependencies = createDependencies({ config, log })
    initialize({ config, dependencies, startServer, watcher, logger: log })
  } catch (error) {
    logAndExit({ msg: 'Bootstrap: Fail' })(error)
  }
}

export default startServer => ({
  configPath = process.cwd(),
  createDependencies = createContainer,
  logFilters
} = {}) => {
  try {
    if (isNotString(configPath)) {
      throw new Error(`Config path must be string, got ${typeof configPath}.`)
    }

    const watcher = chokidar.watch(configPath, { ignoreInitial: true })
    let ready = false
    watcher
      .on('ready', () => {
        ready = true
      })
      .on('error', logAndExit({ msg: 'Watcher: Error' }))
      .on('all', () => {
        logAndExit({ msg: 'Config: Changed' })()
      })

    const configFactory = createConfigFactory(configPath)
    const bootstrap = createBootstrap({
      createDependencies,
      startServer,
      logFilters,
      watcher
    })

    const exit = err => {
      logAndExit({ msg: 'Exit', code: err ? 2 : 0 })(err)
    }

    const run = configFactory => {
      let booted = false
      const boot = () => {
        if (booted) return
        booted = true
        configFactory.create(bootstrap)
      }
      watcher.on('ready', boot)
      if (ready) return boot()
    }

    return {
      exit,
      watcher,
      ready,
      configFactory,
      run
    }
  } catch (err) {
    logAndExit({ msg: 'Config: Fail' })(err)
  }
}
