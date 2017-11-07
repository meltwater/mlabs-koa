import fs from 'fs'
import path from 'path'

import confit from 'confit'
import { defaultTo, isNotObj, isNotString } from '@meltwater/phi'
import createLogger from '@meltwater/mlabs-logger'

const createConfigFactory = configPath => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json')))

  const factory = confit({
    basedir: configPath,
    defaults: 'default.json'
  })

  if (fs.existsSync(path.resolve(configPath, 'local.json'))) {
    factory.addOverride('./local.json')
  }

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
    const healthMonitor = dependencies.resolve('healthMonitor')

    const onStart = () => {
      log.info('Server: Start')
      start().then(() => {
        startServer({config, log, app, healthMonitor})
      }).catch(err => {
        log.fatal({err}, 'Server: Fail')
        process.exit(1)
      })
    }

    const onStop = () => {
      log.info('Server: Stop')
      stop().then(() => {
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

  try {
    const env = config.get('env:env')
    const meta = {
      env,
      name: config.get('pkg:name'),
      version: config.get('pkg:version')
    }

    const logConfig = defaultTo({}, config.get('log'))

    if (isNotObj(logConfig)) {
      throw new Error(`Config key 'log' must be Object, got ${typeof logConfig}.`)
    }

    const log = createLogger({
      ...(env === 'development' ? {} : meta),
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
      throw new Error(`Config path must be String, got ${typeof configPath}.`)
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
