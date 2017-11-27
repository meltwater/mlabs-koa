import { createContainer, asValue, asFunction } from 'awilix'
import Koa from 'koa'
import Router from 'koa-router'
import koaMount from 'koa-mount'
import {
  createHealthMonitor as createMlabsHealthMonitor,
  healthLogging,
  createHealthy
} from '@meltwater/mlabs-health'

import { createServer, koaHealthy } from '../lib'

const createHealthMonitor = () => createMlabsHealthMonitor({
  puppies: container => container.resolve('puppies')
})

const createStart = ({log, healthMonitor}) => async () => {
  healthLogging({log, healthMonitor})
}

const createStop = ({log}) => async () => {}

const createApp = ({log}) => {
  const app = new Koa()
  const router = new Router()

  router.get('/health', koaHealthy())
  app.use(koaMount('/api/v1', router.routes()))
  app.use(koaMount('/api/v1', router.allowedMethods()))

  return app
}

const createPuppies = ({log, reqId}) => {
  const health = () => {
    log.child({service: 'puppies', reqId}).info('Health: Start')
    return true
  }
  return {health}
}

const createDependencies = log => ({config}) => {
  const container = createContainer()

  container.register({
    log: asValue(log),
    healthMethods: asValue({health: createHealthy()}),
    start: asFunction(createStart).singleton(),
    stop: asFunction(createStop).singleton(),
    app: asFunction(createApp).singleton()
  })

  container.register({
    healthMonitor: asFunction(createHealthMonitor).singleton()
  })

  container.register({
    puppies: asFunction(createPuppies).scoped()
  })

  return container
}

export default ({log}) => (port = 9000) => {
  const { configFactory, run } = createServer({
    configPath: __dirname,
    createDependencies: createDependencies(log)
  })

  configFactory.addOverride({port})

  run(configFactory)
}
