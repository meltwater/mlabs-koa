import koaCors from '@koa/cors'
import koaFavicon from 'koa-favicon'
import koaHelmet from 'koa-helmet'
import koaRouter from 'koa-router'
import {
  both,
  complement,
  propEq,
  propOr,
  propSatisfies,
  isObj,
  isString
} from '@meltwater/phi'

import {
  koaError,
  koaRequestId,
  koaRobots
} from './middleware'

const isNotDisabled = complement(both(isObj, propEq('disable', true)))

const useCors = isNotDisabled
const useError = isNotDisabled
const useFavicon = both(isNotDisabled, both(isObj, propSatisfies(isString, 'path')))
const useHelmet = isNotDisabled
const useRequestId = isNotDisabled
const useRobots = isNotDisabled

export default ({
  log,
  app,
  config: {
    cors,
    error,
    favicon,
    helmet,
    requestId,
    robots
  } = {}
} = {}) => {
  const requestIdParamName = propOr('id', 'paramName', requestId)

  const router = koaRouter()

  if (useError(error)) {
    app.use(koaError())
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

  if (useRobots(robots)) {
    router.get('/robots.txt', koaRobots(robots))
  }

  app.use(router.routes())

  app.on('error', (err, ctx) => {
    log.error({err, reqId: ctx[requestIdParamName]}, 'Request Error')
  })

  return app
}
