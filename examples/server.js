import { createContainer, Lifetime } from 'awilix'
import { scopePerRequest } from 'awilix-koa'
import Koa from 'koa'
import { createHealthMonitor, healthLogging } from '@meltwater/mlabs-health'

import { createServer } from '../lib'

const { SINGLETON } = Lifetime

const createHealth = ({log} = {}) => {
  return createHealthMonitor({puppies: true})
}

const createStart = ({log, healthMonitor}) => async () => {
  healthLogging({log, healthMonitor})
  await healthMonitor.puppies.events.emit()
}

const createStop = ({log}) => async () => {}

const createApp = ({log} = {}) => {
  const app = new Koa()
  return app
}

export default ({log}) => (port = 9000) => {
  const createDependencies = ({config}) => {
    const container = createContainer()

    container.registerValue({log})
    container.registerFunction({start: [createStart, {lifetime: SINGLETON}]})
    container.registerFunction({stop: [createStop, {lifetime: SINGLETON}]})
    container.registerFunction({app: [createApp, {lifetime: SINGLETON}]})
    container.registerFunction({healthMonitor: [createHealth, {lifetime: SINGLETON}]})

    container.resolve('app').use(scopePerRequest(container))

    return container
  }

  const { configFactory, run } = createServer({
    configPath: __dirname,
    createDependencies
  })

  configFactory.addOverride({port})

  run(configFactory)
}
