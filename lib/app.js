import koaCors from '@koa/cors'
import koaFavicon from 'koa-favicon'
import koaHelmet from 'koa-helmet'
import Cottage from 'cottage'
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
  koaRequestId
} from './middleware'

import {
  koaRobots
} from './routers'

const isNotDisabled = complement(both(isObj, propEq('disable', true)))

const useCors = isNotDisabled
const useError = isNotDisabled
const useFavicon = both(
  isNotDisabled,
  both(isObj, propSatisfies(isString, 'path'))
)
const useHelmet = isNotDisabled
const useLogger = isNotDisabled
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
    logger,
    requestId,
    robots
  } = {}
} = {}) => {
  const requestIdParamName = propOr('id', 'paramName', requestId)
  const logError = both(useError, propOr(true, 'isLogged'))

  const cottage = new Cottage()

  if (useError(error)) {
    app.use(koaError(error))
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

  if (useRobots(robots)) {
    cottage.get('/robots.txt', koaRobots(robots))
  }

  app.use(cottage.callback())

  if (logError(error)) {
    app.on('error', (err, ctx) => {
      log.error({err, reqId: ctx[requestIdParamName]}, 'Request Error')
    })
  }

  return app
}
