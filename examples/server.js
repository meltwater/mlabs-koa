import { createContainer, asClass, asValue, asFunction } from 'awilix'
import { collectDefaultMetrics, Registry } from 'prom-client'
import Koa from 'koa'
import Router from 'koa-router'
import koaMount from 'koa-mount'
import {
  createHealthMonitor as createMlabsHealthMonitor,
  healthLogging,
  createHealthy
} from '@meltwater/mlabs-health'
import { sleeP } from '@meltwater/phi'

import { createServer, koaHealthy } from '../lib'
import { noLifecycle } from './filters'

const createHealthMonitor = () => createMlabsHealthMonitor({
  puppies: container => container.resolve('puppies')
})

const createStart = ({reqId, log, registry, healthMonitor}) => async () => {
  healthLogging({log, healthMonitor})
  collectDefaultMetrics({register: registry})
  log.info({reqId})
}

const createStop = () => async () => {}

const createApp = () => {
  const app = new Koa()
  const router = new Router()

  router.get('/health', koaHealthy())
  router.get('/puppies/:id', ctx => {
    const puppies = ctx.state.container.resolve('puppies')
    ctx.body = {data: puppies.get(ctx.params.id)}
    ctx.status = 200
  })
  app.use(koaMount('/api/v1', router.routes()))
  app.use(koaMount('/api/v1', router.allowedMethods()))

  return app
}

const createPuppies = ({log, reqId}) => {
  const get = id => {
    log.info('Bark')
    return id
  }
  const health = async () => {
    log.child({service: 'puppies', reqId}).info('Health: Start')
    await sleeP(4000)
    return true
  }
  return {health, get}
}

const createDependencies = ({log, config}) => {
  const container = createContainer()

  container.register({
    log: asValue(log),
    registry: asClass(Registry).singleton(),
    healthMethods: asValue({health: createHealthy()}),
    healthMonitor: asFunction(createHealthMonitor).singleton(),
    start: asFunction(createStart).singleton(),
    stop: asFunction(createStop).singleton(),
    app: asFunction(createApp).singleton()
  })

  container.register({
    puppies: asFunction(createPuppies).scoped()
  })

  return container
}

// NOTE: This example does not use config files,
// but must still pass a configPath.
export default ({log}) => (port = 9000) => {
  const { configFactory, run } = createServer({
    logFilters: {noLifecycle},
    configPath: __dirname,
    createDependencies
  })

  configFactory.addOverride({port})

  run(configFactory)
  return new Promise(() => {})
}
