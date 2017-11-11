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
  const requestIdParamName = propOr('id', 'paramName', requestId)
  const isErrorLogged = both(useError, propOr(true, 'isLogged'))(error)
  const rootData = propOr(pkg, 'data', root)
  const useConditionalGet = both(isNotDisabled, always(useEtag(etag)))

  const router = new Router()

  if (useError(error)) {
    app.use(koaError(error))
  }

  if (useConditionalGet(conditionalGet)) {
    app.use(koaConditionalGet())
  }

  if (useEtag(etag)) {
    app.use(koaEtag())
  }

  if (useLogger(logger)) {
    app.use(koaLogger(error))
  }

  if (useHelmet(helmet)) {
    app.use(koaHelmet(helmet))
  }

  if (useCors(cors)) {
    app.use(koaCors(cors))
  }

  if (useRequestId(requestId)) {
    app.use(koaRequestId({paramName: requestIdParamName, ...requestId}))
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
    router.use('/health', koaHealth({
      healthMonitor,
      healthMethods,
      ...health
    }).routes())
  }

  if (useStatus(status)) {
    router.use('/status', koaStatus({
      healthMonitor,
      healthMethods,
      ...status
    }).routes())
  }

  if (useDependencyInjection(dependencyInjection)) {
    app.use(koaDependencyInjection({requestIdParamName, ...dependencyInjection}))
  }

  app.use(router.routes())
  app.use(router.allowedMethods())

  if (isErrorLogged) {
    app.on('error', (err, ctx) => {
      log.error({err, reqId: ctx.state[requestIdParamName]}, 'Request Error')
    })
  }

  return app
}
