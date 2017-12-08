import Koa from 'koa'
import Router from 'koa-router'
import koaConditionalGet from 'koa-conditional-get'
import koaCors from '@koa/cors'
import koaEtag from 'koa-etag'
import koaFavicon from 'koa-favicon'
import koaHelmet from 'koa-helmet'
import koaLogger from 'koa-logger'
import {
  always,
  both,
  complement,
  propEq,
  propOr,
  propSatisfies,
  isObj,
  isString
} from '@meltwater/phi'

import {
  koaDependencyInjection,
  koaError,
  koaHealthy,
  koaLog,
  koaLogger as koaProdLogger,
  koaRequestId,
  koaResponseTime
} from './middleware'

import {
  koaHealth,
  koaRobots,
  koaStatus
} from './routers'

const isNotDisabled = complement(both(isObj, propEq('disable', true)))

const useCors = isNotDisabled
const useDependencyInjection = isNotDisabled
const useError = isNotDisabled
const useEtag = isNotDisabled
const useFavicon = both(
  isNotDisabled,
  both(isObj, propSatisfies(isString, 'path'))
)
const useHealth = isNotDisabled
const useHelmet = isNotDisabled
const useLogger = isNotDisabled
const usePing = isNotDisabled
const useRequestId = isNotDisabled
const useResponseTime = isNotDisabled
const useRobots = isNotDisabled
const useRoot = isNotDisabled
const useStatus = isNotDisabled

export default ({
  pkg,
  healthMonitor,
  healthMethods,
  isProduction,
  config: {
    conditionalGet,
    cors,
    dependencyInjection,
    error,
    etag,
    favicon,
    health,
    helmet,
    logger,
    ping,
    requestId,
    responseTime,
    robots,
    root,
    status
  } = {}
} = {}) => {
  const app = new Koa()
  const rootData = propOr(pkg, 'data', root)
  const requestIdParamName = propOr('reqId', 'paramName', requestId)
  const useProductionLogger = propOr(isProduction, 'useProduction', logger)
  const useConditionalGet = both(isNotDisabled, always(useEtag(etag)))
  const pingPath = propOr('/ping', 'path', ping)
  const healthPath = propOr('/health', 'path', health)
  const statusPath = propOr('/status', 'path', status)

  const router = new Router()

  if (useResponseTime(responseTime)) {
    app.use(koaResponseTime(responseTime))
  }

  if (useRequestId(requestId)) {
    app.use(koaRequestId({...requestId, paramName: requestIdParamName}))
  }

  if (useLogger(logger)) {
    app.use(koaLog({requestIdParamName, addHttp: useProductionLogger}))
    useProductionLogger
      ? app.use(koaProdLogger(logger))
      : app.use(koaLogger(logger))
  }

  if (useError(error)) {
    app.use(koaError(error))
  }

  if (useDependencyInjection(dependencyInjection)) {
    app.use(koaDependencyInjection({...dependencyInjection, requestIdParamName}))
  }

  if (useHelmet(helmet)) {
    app.use(koaHelmet(helmet))
  }

  if (useCors(cors)) {
    app.use(koaCors(cors))
  }

  if (useConditionalGet(conditionalGet)) {
    app.use(koaConditionalGet(conditionalGet))
  }

  if (useEtag(etag)) {
    app.use(koaEtag(etag))
  }

  if (useRoot(root)) {
    router.get('/', (ctx) => { ctx.body = rootData })
  }

  if (useFavicon(favicon)) {
    app.use(koaFavicon(favicon.path, favicon))
  }

  if (useRobots(robots)) {
    router.get('/robots.txt', koaRobots(robots))
  }

  if (usePing(ping)) {
    router.get(pingPath, koaHealthy(ping))
  }

  if (useHealth(health)) {
    router.use(healthPath, koaHealth({
      ...health,
      healthMonitor,
      healthMethods
    }).routes())
  }

  if (useStatus(status)) {
    router.use(statusPath, koaStatus({
      ...status,
      healthMonitor,
      healthMethods
    }).routes())
  }

  app.use(router.routes())
  app.use(router.allowedMethods())

  return app
}
