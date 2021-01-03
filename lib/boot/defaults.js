import os from 'os'

import { aliasTo, asFunction, asValue } from 'awilix'
import { Registry } from 'prom-client'
import { createHealthMonitor } from '@meltwater/mlabs-health'
import Koa from 'koa'
import { snakeCase } from 'change-case'
import {
  compose,
  defaultTo,
  join,
  map,
  prop,
  isUndefined,
  split,
  test
} from '@meltwater/phi'

import { createAppMetrics, createCollectAppMetrics } from './metrics.js'

const allowUnregistered = true

const defaultStartupDelay = 0
const defaultShutdownDelay = 0
const defaultShutdownOnChange = true
const defaultExitOnUnhandledRejection = true
const defaultExitOnFalseStart = true
const defaultShutdownTimeout = 60000

const defaultStart = () => () => Promise.resolve()
const defaultStop = defaultStart

const defaultHealthMethods = {
  health: prop('healthy')
}

const defaultApp = () => new Koa()

const defaultHealthMonitor = () =>
  createHealthMonitor({
    http: true
  })

const defaultRegistry = () => new Registry()
const defaultAppMetricDefs = () => []
const defaultAppMetrics = createAppMetrics
const defaultCollectAppMetrics = createCollectAppMetrics
const defaultAppMetricOptions = {}
const defaultAppMetricPrefix = 'koa_app_'

const createRegister = (dependencies) => (k, f) => {
  const dep = dependencies.resolve(k, { allowUnregistered })
  if (isUndefined(dep)) dependencies.register(k, asFunction(f).singleton())
}

const registerRequired = (dependencies, config) => {
  const register = createRegister(dependencies)

  const healthMethods = dependencies.resolve('healthMethods', {
    allowUnregistered
  })
  if (isUndefined(healthMethods)) {
    dependencies.register('healthMethods', asValue(defaultHealthMethods))
  }

  const reqId = dependencies.resolve('reqId', { allowUnregistered })
  if (isUndefined(reqId)) {
    dependencies.register('reqId', asValue(os.hostname()))
  }

  const appMetricPrefix = config.get('metrics:prefix')
  const metricPrefix = compose(
    formatMetricPrefix,
    defaultTo(defaultAppMetricPrefix)
  )(appMetricPrefix)

  if (!test(/^[a-z0-9_]+$/i, metricPrefix)) {
    throw new Error(`Invalid metrics prefix ${metricPrefix}`)
  }

  dependencies.register('metricPrefix', asValue(metricPrefix))

  const appMetricOptions = config.get('metrics:options')
  const metricOptions = defaultTo(defaultAppMetricOptions, appMetricOptions)
  dependencies.register('metricOptions', asValue(metricOptions))

  register('metricDefs', defaultAppMetricDefs)
  register('appMetrics', defaultAppMetrics)
  register('collectAppMetrics', defaultCollectAppMetrics)

  register('app', defaultApp)
  register('healthMonitor', defaultHealthMonitor)
  register('registry', defaultRegistry)

  dependencies.register('metrics', aliasTo('appMetrics'))
}

export const getLifecycle = (dependencies) => {
  const register = createRegister(dependencies)

  register('start', defaultStart)
  register('stop', defaultStop)

  return {
    start: dependencies.resolve('start'),
    stop: dependencies.resolve('stop')
  }
}

const getConfig = (config) => {
  const shutdownOnChange = config.get('shutdownOnChange')
  const exitOnUnhandledRejection = config.get('exitOnUnhandledRejection')
  const exitOnFalseStart = config.get('exitOnFalseStart')
  const shutdownTimeout = config.get('shutdownTimeout')

  const startupDelay = parseInt(
    defaultTo(config.get('startupDelay'), config.get('STARTUP_DELAY'))
  )

  const shutdownDelay = parseInt(
    defaultTo(config.get('shutdownDelay'), config.get('SHUTDOWN_DELAY'))
  )

  return {
    shutdownTimeout: defaultTo(defaultShutdownTimeout, shutdownTimeout),
    shutdownOnChange: defaultTo(defaultShutdownOnChange, shutdownOnChange),
    startupDelay: defaultTo(defaultStartupDelay, startupDelay),
    shutdownDelay: defaultTo(defaultShutdownDelay, shutdownDelay),
    exitOnUnhandledRejection: defaultTo(
      defaultExitOnUnhandledRejection,
      exitOnUnhandledRejection
    ),
    exitOnFalseStart: defaultTo(defaultExitOnFalseStart, exitOnFalseStart)
  }
}

const formatMetricPrefix = compose(join('_'), map(snakeCase), split('_'))

export default (dependencies, config) => {
  registerRequired(dependencies, config)

  return {
    app: dependencies.resolve('app'),
    healthMethods: dependencies.resolve('healthMethods'),
    healthMonitor: dependencies.resolve('healthMonitor'),
    registry: dependencies.resolve('registry'),
    ...getConfig(config)
  }
}
