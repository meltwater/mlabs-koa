import { Registry } from 'prom-client'
import { createHealthMonitor } from '@meltwater/mlabs-health'
import Koa from 'koa'
import {
  defaultTo,
  prop
} from '@meltwater/phi'

const allowUnregistered = true

const defaultShutdownDelay = 0
const defaultShutdownOnChange = true
const defaultExitOnFalseStart = true

const defaultStart = () => () => Promise.resolve()
const defaultStop = () => () => Promise.resolve()

const defaultHealthMethods = {
  health: prop('healthy')
}

const defaultApp = () => new Koa()

const defaultHealthMonitor = () => createHealthMonitor({
  http: true
})

const defaultRegistry = () => new Registry()

export default (dependencies, config) => {
  const app = dependencies.resolve('app', {allowUnregistered})
  const start = dependencies.resolve('start', {allowUnregistered})
  const stop = dependencies.resolve('stop', {allowUnregistered})
  const healthMethods = dependencies.resolve('healthMethods', {allowUnregistered})
  const healthMonitor = dependencies.resolve('healthMonitor', {allowUnregistered})
  const registry = dependencies.resolve('registry', {allowUnregistered})

  const shutdownOnChange = config.get('shutdownOnChange')

  const exitOnFalseStart = config.get('exitOnFalseStart')

  const shutdownDelay = parseInt(
    defaultTo(config.get('shutdownDelay'), config.get('SHUTDOWN_DELAY'))
  )

  return {
    app: app || defaultApp(),
    start: start || defaultStart(),
    stop: stop || defaultStop(),
    healthMethods: healthMethods || defaultHealthMethods,
    healthMonitor: healthMonitor || defaultHealthMonitor(),
    registry: registry || defaultRegistry(),
    shutdownOnChange: defaultTo(defaultShutdownOnChange, shutdownOnChange),
    shutdownDelay: defaultTo(defaultShutdownDelay, shutdownDelay),
    exitOnFalseStart: defaultTo(defaultExitOnFalseStart, exitOnFalseStart)
  }
}
