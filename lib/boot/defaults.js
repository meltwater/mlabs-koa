import os from 'os'

import { asFunction, asValue } from 'awilix'
import { Registry } from 'prom-client'
import { createHealthMonitor } from '@meltwater/mlabs-health'
import Koa from 'koa'
import {
  defaultTo,
  prop,
  isUndefined
} from '@meltwater/phi'

const allowUnregistered = true

const defaultShutdownDelay = 0
const defaultShutdownOnChange = true
const defaultExitOnFalseStart = true

const defaultStart = () => () => Promise.resolve()
const defaultStop = defaultStart

const defaultHealthMethods = {
  health: prop('healthy')
}

const defaultApp = () => new Koa()

const defaultHealthMonitor = () => createHealthMonitor({
  http: true
})

const defaultRegistry = () => new Registry()

const registerRequired = dependencies => {
  const register = (k, f) => {
    const dep = dependencies.resolve(k, {allowUnregistered})
    if (isUndefined(dep)) dependencies.register(k, asFunction(f).singleton())
  }

  const healthMethods = dependencies.resolve('healthMethods', {allowUnregistered})
  if (isUndefined(healthMethods)) {
    dependencies.register('healthMethods', asValue(defaultHealthMethods))
  }

  const reqId = dependencies.resolve('reqId', {allowUnregistered})
  if (isUndefined(reqId)) {
    dependencies.register('reqId', asValue(os.hostname()))
  }

  register('app', defaultApp)
  register('start', defaultStart)
  register('stop', defaultStop)
  register('healthMonitor', defaultHealthMonitor)
  register('registry', defaultRegistry)
}

const getConfig = config => {
  const shutdownOnChange = config.get('shutdownOnChange')
  const exitOnFalseStart = config.get('exitOnFalseStart')
  const shutdownDelay = parseInt(
    defaultTo(config.get('shutdownDelay'), config.get('SHUTDOWN_DELAY'))
  )

  return {
    shutdownOnChange: defaultTo(defaultShutdownOnChange, shutdownOnChange),
    shutdownDelay: defaultTo(defaultShutdownDelay, shutdownDelay),
    exitOnFalseStart: defaultTo(defaultExitOnFalseStart, exitOnFalseStart)
  }
}

export default (dependencies, config) => {
  registerRequired(dependencies)

  return {
    app: dependencies.resolve('app'),
    start: dependencies.resolve('start'),
    stop: dependencies.resolve('stop'),
    healthMethods: dependencies.resolve('healthMethods'),
    healthMonitor: dependencies.resolve('healthMonitor'),
    registry: dependencies.resolve('registry'),
    ...getConfig(config)
  }
}
