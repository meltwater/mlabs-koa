import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import { createContainer, asValue } from 'awilix'
import confit from 'confit'
import chokidar from 'chokidar'
import {
  isNotString,
  sleeP
} from '@meltwater/phi'
import createLogger from '@meltwater/mlabs-logger'

import createStatus from './status'
import getDefaults from './defaults'
import getLoggerOptions from './logger'

const isLifecycle = true
const isDotfile = name => !(/^\./.test(name))

const createConfigFactory = configPath => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json')))

  const factory = confit({
    basedir: configPath,
    defaults: 'default.json'
  })

  const addOverride = name => {
    if (!fs.existsSync(path.resolve(configPath, `${name}.json`))) return
    factory.addOverride(`./${name}.json`)
  }

  const addOverrides = subpath => {
    const fullPath = path.resolve(configPath, subpath)
    if (!fs.existsSync(fullPath)) return
    fs.readdirSync(fullPath)
      .filter(isDotfile)
      .filter(name => /\.json$/.test(name))
      .sort()
      .forEach(name => { factory.addOverride(`./${subpath}/${name}`) })
  }

  const addSecrets = subpath => {
    const fullPath = path.resolve(configPath, subpath)
    if (!fs.existsSync(fullPath)) return

    const readSecret = name => (
      fs.readFileSync(path.resolve(fullPath, name))
        .toString()
        .trim()
    )

    const secret = fs.readdirSync(fullPath)
      .filter(isDotfile)
      .sort()
      .reduce((acc, name) => ({...acc, [name]: readSecret(name)}), {})

    factory.addOverride({secret})
  }

  addSecrets('secret.d')
  addOverrides('env.d')
  addOverride('env')
  addOverrides('local.d')
  addOverride('local')

  factory.addOverride({config: configPath})
  factory.addOverride({pkg})

  return factory
}

const initialize = ({config, dependencies, startServer, watcher, logger}) => {
  const log = dependencies.resolve('log', {allowUnregistered: true}) || logger
  dependencies.register({log: asValue(log)})
  const lifeLog = log.child({isLifecycle})
  try {
    lifeLog.info('Initialize: Start')

    const configPath = config.get('config')
    const {
      app,
      start,
      stop,
      healthMethods,
      healthMonitor,
      registry,
      shutdownDelay,
      shutdownOnChange,
      exitOnFalseStart
    } = getDefaults(dependencies, config)

    let server = {close: cb => cb()}
    const status = createStatus()

    const onStart = () => {
      server = startServer({
        config,
        log,
        app,
        healthMonitor,
        healthMethods,
        registry,
        status,
        dependencies
      })
    }

    status.on('listen', () => {
      start().then(() => {
        status.emit('started')
        lifeLog.info('Startup: Success')
      }).catch(err => {
        lifeLog.fatal({err}, 'Startup: Fail')
        if (exitOnFalseStart) process.exit(1)
      })
    })

    const onStop = () => {
      if (status.isStopping()) return
      status.emit('stopped')
      const close = promisify(cb => server.close(cb))
      sleeP(shutdownDelay).then(() => close()).then(() => {
        lifeLog.info('Server: Close')
      }).then(stop).then(() => {
        lifeLog.info('Shutdown: Success')
        process.exit()
      }).catch(err => {
        lifeLog.fatal({err}, 'Shutdown: Fail')
        process.exit(1)
      })
    }

    watcher.close()
    chokidar.watch(configPath, {ignoreInitial: true}).on('error', err => {
      lifeLog.fatal({err, isLifecycle}, 'Watcher: Error')
      status.emit('stale')
    }).on('all', () => {
      lifeLog.info('Config: Changed')
      status.emit('stale')
    })

    process.on('SIGINT', () => {
      lifeLog.info('Signal: Interrupt')
      onStop()
    })

    process.on('SIGTERM', () => {
      lifeLog.info('Signal: Terminate')
      onStop()
    })

    if (shutdownOnChange) status.on('stale', onStop)
    onStart()
  } catch (err) {
    lifeLog.fatal({err}, 'Initialize: Fail')
    process.exit(1)
  }
}

const createBootstrap = ({
  createDependencies,
  startServer,
  logFilters,
  watcher
}) => (err, config) => {
  if (err) {
    createLogger().fatal({err, isLifecycle}, 'Config: Fail')
    process.exit(1)
  }

  try {
    const logOptions = getLoggerOptions({config, logFilters})
    const log = createLogger(logOptions)
    const dependencies = createDependencies({config, log})
    initialize({config, dependencies, startServer, watcher, logger: log})
  } catch (error) {
    createLogger().fatal({isLifecycle, err: error}, 'Bootstrap: Fail')
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

    const watcher = chokidar.watch(configPath, {ignoreInitial: true})
    watcher.on('error', err => {
      createLogger().fatal({err, isLifecycle}, 'Watcher: Error')
      process.exit(1)
    }).on('all', () => {
      createLogger().fatal({isLifecycle}, 'Config: Changed')
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
      createLogger().fatal({err, isLifecycle}, 'Exit')
      process.exit(err ? 2 : 0)
    }

    return {
      exit,
      configFactory,
      run: configFactory => configFactory.create(bootstrap)
    }
  } catch (err) {
    createLogger().fatal({err, isLifecycle}, 'Config: Fail')
    process.exit(1)
  }
}
