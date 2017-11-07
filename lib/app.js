import koaFavicon from 'koa-favicon'
import koaHelmet from 'koa-helmet'
import koaRouter from 'koa-router'
import {
  both,
  complement,
  propEq,
  propSatisfies,
  isObj,
  isString
} from '@meltwater/phi'

import {
  koaRequestId,
  koaRobots
} from './middleware'

const useFavicon = both(isObj, propSatisfies(isString, 'path'))
const useRobots = complement(both(isObj, propEq('disable', true)))
const useRequestId = complement(both(isObj, propEq('disable', true)))

export default ({
  log,
  app,
  config: {
    helmet,
    robots,
    requestId,
    favicon
  } = {}
} = {}) => {
  const router = koaRouter()

  app.use(koaHelmet(helmet))

  if (useRequestId(requestId)) {
    app.use(koaRequestId(requestId))
  }

  if (useFavicon(favicon)) {
    app.use(koaFavicon(favicon.path, favicon))
  }

  if (useRobots(robots)) {
    router.get('/robots.txt', koaRobots(robots))
  }

  app.use(router.routes())

  return app
}
