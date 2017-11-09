import { createContainer, Lifetime } from 'awilix'
import Koa from 'koa'
import Router from 'koa-router'
import { createHealthMonitor, healthLogging } from '@meltwater/mlabs-health'

import { createServer, koaHealthy } from '../lib'

const { SCOPED, SINGLETON } = Lifetime

const createHealth = container => {
  return createHealthMonitor({puppies: () => container.resolve('puppies')})
}

const createStart = ({log, healthMonitor}) => async () => {
  healthLogging({log, healthMonitor})
  await healthMonitor.puppies.events.emit()
}

const createStop = ({log}) => async () => {}

const createApp = ({log} = {}) => {
  const app = new Koa()
  const router = new Router()

  router.get('/api/v1/health', koaHealthy())
  app.use(router.routes())
  app.use(router.allowedMethods())

  return app
}

const createPuppies = ({log, reqId} = {}) => {
  const health = () => {
    log.child({service: 'puppies'}).info('Health: Start')
    return true
  }
  return {health}
}

export default ({log}) => (port = 9000) => {
  const createDependencies = ({config}) => {
    const container = createContainer()

    container.registerValue({log})
    container.registerValue({reqId: null})
    container.registerValue({createHealthMonitor: createHealth})
    container.registerFunction({start: [createStart, {lifetime: SINGLETON}]})
    container.registerFunction({stop: [createStop, {lifetime: SINGLETON}]})
    container.registerFunction({app: [createApp, {lifetime: SINGLETON}]})

    container.registerFunction({puppies: [createPuppies, {lifetime: SCOPED}]})

    return container
  }

  const { configFactory, run } = createServer({
    configPath: __dirname,
    createDependencies
  })

  configFactory.addOverride({port})

  run(configFactory)
}
