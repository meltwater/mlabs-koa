import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

import confit from 'confit'
import { defaultTo, isNotObj, isNotString } from '@meltwater/phi'
import createLogger from '@meltwater/mlabs-logger'

import splitName from './split-name'

const createConfigFactory = configPath => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json')))

  const factory = confit({
    basedir: configPath,
    defaults: 'default.json'
  })

  const addOverride = name => {
    if (fs.existsSync(path.resolve(configPath, `${name}.json`))) {
      factory.addOverride(`./${name}.json`)
    }
  }

  addOverride('env')
  addOverride('local')

  factory.addOverride({config: configPath})
  factory.addOverride({pkg})

  return factory
}

const initialize = ({config, dependencies, startServer}) => {
  const log = dependencies.resolve('log')
  try {
    log.info('Initialize: Start')

    const configPath = config.get('config')
    const app = dependencies.resolve('app')
    const start = dependencies.resolve('start')
    const stop = dependencies.resolve('stop')
    const healthMethods = dependencies.resolve('healthMethods')
    const healthMonitor = dependencies.resolve('healthMonitor')

    let server = {close: cb => cb()}

    const onStart = () => {
      log.info('Server: Start')
      start().then(() => {
        server = startServer({
          config,
          log,
          app,
          healthMonitor,
          healthMethods,
          dependencies
        })
      }).catch(err => {
        log.fatal({err}, 'Server: Fail')
        process.exit(1)
      })
    }

    const onStop = () => {
      const close = promisify(cb => server.close(cb))
      close().then(() => {
        log.info('Server: Stop')
      }).then(stop).then(() => {
        log.info('Shutdown: Success')
        process.exit()
      }).catch(err => {
        log.fatal({err}, 'Shutdown: Fail')
        process.exit(1)
      })
    }

    fs.unwatchFile(configPath)
    fs.watch(configPath, {persistent: false, recursive: true}, () => {
      log.info('Config: Changed')
      onStop()
    })

    process.on('SIGINT', () => {
      log.info('Signal: Interrupt')
      onStop()
    })

    process.on('SIGTERM', () => {
      log.info('Signal: Terminate')
      onStop()
    })

    onStart()
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

  const [ defaultService, defaultSystem ] = splitName(config.get('pkg:name'))

  try {
    const {
      env,
      service = defaultService,
      system = defaultSystem,
      ...logConfig
    } = defaultTo({}, config.get('log'))

    const meta = {
      '@service': defaultTo(service, config.get('LOG_SERVICE')),
      '@system': defaultTo(system, config.get('LOG_SYSTEM')),
      '@env': defaultTo(env, config.get('LOG_ENV')),
      name: config.get('pkg:name'),
      version: config.get('pkg:version')
    }

    if (isNotObj(logConfig)) {
      throw new Error(`Config key 'log' must be object, got ${typeof logConfig}.`)
    }

    const log = createLogger({
      ...(config.get('env:development') ? {} : meta),
      ...logConfig
    })

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
    if (isNotString(configPath)) {
      throw new Error(`Config path must be string, got ${typeof configPath}.`)
    }

    fs.watchFile(configPath, {persistent: false, recursive: true}, () => {
      createLogger().fatal('Config: Changed')
      process.exit(1)
    })

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
