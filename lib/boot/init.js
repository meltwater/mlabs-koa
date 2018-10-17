import { promisify } from 'util'

import { asValue } from 'awilix'
import chokidar from 'chokidar'
import { sleeP } from '@meltwater/phi'

import createStatus from './status'
import getDefaults from './defaults'

const isLifeCycleLog = true

export default ({ config, dependencies, startServer, watcher, logger }) => {
  const log = dependencies.resolve('log', { allowUnregistered: true }) || logger
  dependencies.register({ log: asValue(log) })
  const lifeLog = log.child({ isLifeCycleLog })
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

    let server = { close: cb => cb() }
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
        lifeLog.fatal({ err }, 'Startup: Fail')
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
        lifeLog.fatal({ err }, 'Shutdown: Fail')
        process.exit(1)
      })
    }

    watcher.close()
    chokidar.watch(configPath, { ignoreInitial: true }).on('error', err => {
      lifeLog.fatal({ err, isLifeCycleLog }, 'Watcher: Error')
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
    lifeLog.fatal({ err }, 'Initialize: Fail')
    process.exit(1)
  }
}
