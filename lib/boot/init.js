import { limit } from 'awaiting'
import { promisify } from 'util'

import { asValue } from 'awilix'
import chokidar from 'chokidar'
import { logAndExit } from './logger'
import { sleeP } from '@meltwater/phi'

import createStatus from './status'
import getDefaults, { getLifecycle } from './defaults'

const isLifeCycleLog = true
const isAppLog = false

export default ({ config, dependencies, startServer, watcher, logger }) => {
  const log = dependencies.resolve('log', { allowUnregistered: true }) || logger
  dependencies.register({ log: asValue(log) })
  const lifeLog = log.child({ isLifeCycleLog, isAppLog })
  try {
    lifeLog.info('Initialize: Start')

    const configPath = config.get('config')
    const {
      app,
      healthMethods,
      healthMonitor,
      registry,
      shutdownTimeout,
      startupDelay,
      shutdownDelay,
      shutdownOnChange,
      exitOnUnhandledRejection,
      exitOnFalseStart
    } = getDefaults(dependencies, config)

    let server = { close: (cb) => cb() }
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
      dependencies.register('server', asValue(server))
    }

    const onFalseStart = exitOnFalseStart
      ? logAndExit({ msg: 'Startup: Fail', log })
      : (err) => {
          lifeLog.fatal({ err }, 'Startup: Fail')
        }

    status.on('listen', () => {
      const { start } = getLifecycle(dependencies)
      sleeP(startupDelay)
        .then(start)
        .then(() => {
          status.emit('started')
          lifeLog.info('Startup: Success')
        })
        .catch(onFalseStart)
    })

    const onStop = () => {
      if (status.isStopping()) return
      status.emit('stopped')
      const close = promisify((cb) => server.close(cb))
      const { stop } = getLifecycle(dependencies)
      sleeP(shutdownDelay)
        .then(() => close())
        .then(() => {
          lifeLog.info('Server: Close')
        })
        .then(() => limit(stop(), shutdownTimeout))
        .then(
          logAndExit({
            msg: 'Shutdown: Success',
            level: 'info',
            code: 0,
            log
          })
        )
        .catch(logAndExit({ msg: 'Shutdown: Fail', log }))
    }

    chokidar
      .watch(configPath, { ignoreInitial: true })
      .on('error', (err) => {
        lifeLog.fatal({ err, isLifeCycleLog, isAppLog }, 'Watcher: Error')
        status.emit('stale')
      })
      .on('all', () => {
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

    const onUnhandledRejection = exitOnUnhandledRejection
      ? logAndExit({ msg: 'Unhandled Rejection', log })
      : (err) => {
          lifeLog.fatal({ err }, 'Unhandled Rejection')
        }

    process.on('unhandledRejection', onUnhandledRejection)

    process.on(
      'uncaughtException',
      logAndExit({ msg: 'Uncaught Exception', log })
    )

    if (shutdownOnChange) status.on('stale', onStop)
    onStart()
  } catch (err) {
    logAndExit({ msg: 'Initialize: Fail', log })(err)
  }
}
