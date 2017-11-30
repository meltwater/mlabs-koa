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
  koaRequestId
} from './middleware'

import {
  koaHealth,
  koaRobots,
  koaStatus
} from './routers'

const isNotDisabled = complement(both(isObj, propEq('disable', true)))

const useCors = isNotDisabled
const useDependencyInjection = isNotDisabled
const useEtag = isNotDisabled
const useError = isNotDisabled
const useFavicon = both(
  isNotDisabled,
  both(isObj, propSatisfies(isString, 'path'))
)
const useHelmet = isNotDisabled
const useLogger = isNotDisabled
const useRoot = isNotDisabled
const useRequestId = isNotDisabled
const useRobots = isNotDisabled
const useHealth = isNotDisabled
const useStatus = isNotDisabled

export default ({
  log,
  pkg,
  healthMonitor,
  healthMethods,
  requestIdParamName,
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
    requestId,
    root,
    status,
    robots
  } = {}
} = {}) => {
  const app = new Koa()
  const rootData = propOr(pkg, 'data', root)
  const useConditionalGet = both(isNotDisabled, always(useEtag(etag)))
  const healthPath = propOr('/health', 'path', health)
  const statusPath = propOr('/status', 'path', status)

  const router = new Router()

  if (useLogger(logger)) {
    app.use(koaLogger(logger))
  }

  if (useError(error)) {
    app.use(koaError(error))
  }

  if (useConditionalGet(conditionalGet)) {
    app.use(koaConditionalGet(conditionalGet))
  }

  if (useEtag(etag)) {
    app.use(koaEtag(etag))
  }

  if (useHelmet(helmet)) {
    app.use(koaHelmet(helmet))
  }

  if (useCors(cors)) {
    app.use(koaCors(cors))
  }

  if (useRequestId(requestId)) {
    app.use(koaRequestId({...requestId, paramName: requestIdParamName}))
  }

  if (useFavicon(favicon)) {
    app.use(koaFavicon(favicon.path, favicon))
  }

  if (useRoot(root)) {
    router.get('/', (ctx) => { ctx.body = rootData })
  }

  if (useRobots(robots)) {
    router.get('/robots.txt', koaRobots(robots))
  }

  if (useHealth(health)) {
    router.use(healthPath, koaHealth({
      ...health,
      log,
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

  if (useDependencyInjection(dependencyInjection)) {
    app.use(koaDependencyInjection({...dependencyInjection, requestIdParamName}))
  }

  app.use(router.routes())
  app.use(router.allowedMethods())

  return app
}
