import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import confit from 'confit'
import chokidar from 'chokidar'
import {
  defaultTo,
  defaultWhen,
  has,
  isNilOrEmpty,
  isNotObj,
  isNotString
} from '@meltwater/phi'
import createLogger from '@meltwater/mlabs-logger'

import splitName from './split-name'

const isLifecycle = true
const isDotfile = name => !(/^\./.test(name))
const defaultWhenNilOrEmpty = defaultWhen(isNilOrEmpty)

const getLoggerOptions = ({config, logFilters = {}}) => {
  const [ defaultService, defaultSystem ] = splitName(config.get('pkg:name'))

  const {
    env,
    name = config.get('pkg:name'),
    version = config.get('pkg:version'),
    service = defaultService,
    system = defaultSystem,
    outputMode = 'short',
    filter = null,
    base = {},
    ...logConfig
  } = defaultTo({}, config.get('log'))

  const logBase = {
    '@service': defaultWhenNilOrEmpty(service, config.get('LOG_SERVICE')),
    '@system': defaultWhenNilOrEmpty(system, config.get('LOG_SYSTEM')),
    '@env': defaultWhenNilOrEmpty(env, config.get('LOG_ENV')),
    version: defaultWhenNilOrEmpty(version, config.get('LOG_VERSION')),
    ...base
  }

  const getDevLogConfig = () => {
    const filterName = defaultWhenNilOrEmpty(filter, config.get('LOG_FILTER'))

    if (filterName && !has(filterName, logFilters)) {
      throw new Error(`Log output filter ${filterName} not found.`)
    }

    const outputFilter = filterName ? logFilters[filterName] : null

    return {
      outputFilter,
      outputMode: defaultWhenNilOrEmpty(outputMode, config.get('LOG_OUTPUT_MODE'))
    }
  }

  if (isNotObj(logConfig)) {
    throw new Error(`Config key 'log' must be object, got ${typeof logConfig}.`)
  }

  const logLevel = config.get('LOG_LEVEL')

  return {
    name,
    base,
    outputMode,
    ...(config.get('env:development') ? getDevLogConfig() : {}),
    ...logConfig,
    ...(config.get('env:production') ? {outputMode: null, base: logBase} : {}),
    ...(isNilOrEmpty(logLevel) ? {} : {level: logLevel})
  }
}

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

const initialize = ({config, dependencies, startServer, watcher}) => {
  const log = dependencies.resolve('log')
  const lifeLog = log.child({isLifecycle})
  try {
    lifeLog.info('Initialize: Start')

    const configPath = config.get('config')
    const app = dependencies.resolve('app')
    const start = dependencies.resolve('start')
    const stop = dependencies.resolve('stop')
    const healthMethods = dependencies.resolve('healthMethods')
    const healthMonitor = dependencies.resolve('healthMonitor')
    const registry = dependencies.resolve('registry', {allowUnregistered: true})

    let server = {close: cb => cb()}

    const onStart = () => {
      lifeLog.info('Server: Start')
      start().then(() => {
        server = startServer({
          config,
          log,
          app,
          healthMonitor,
          healthMethods,
          registry,
          dependencies
        })
      }).catch(err => {
        lifeLog.fatal({err}, 'Server: Fail')
        process.exit(1)
      })
    }

    const onStop = () => {
      const close = promisify(cb => server.close(cb))
      close().then(() => {
        lifeLog.info('Server: Stop')
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
      onStop()
    }).on('all', () => {
      lifeLog.info('Config: Changed')
      onStop()
    })

    process.on('SIGINT', () => {
      lifeLog.info('Signal: Interrupt')
      onStop()
    })

    process.on('SIGTERM', () => {
      lifeLog.info('Signal: Terminate')
      onStop()
    })

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
    initialize({config, log, dependencies, startServer, watcher})
  } catch (error) {
    createLogger().fatal({isLifecycle, err: error}, 'Bootstrap: Fail')
    process.exit(1)
  }
}

export default (
  startServer
) => ({
  configPath,
  createDependencies,
  logFilters
}) => {
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
