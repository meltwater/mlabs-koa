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
  koaRobots
} from './middleware'

const useFavicon = both(isObj, propSatisfies(isString, 'path'))
const useRobots = complement(both(isObj, propEq('disable', true)))

export default ({
  log,
  app,
  config: {
    helmet,
    robots,
    favicon
  } = {}
} = {}) => {
  const router = koaRouter()

  app.use(koaHelmet(helmet))

  if (useFavicon(favicon)) {
    app.use(koaFavicon(favicon.path, favicon))
  }

  if (useRobots(robots)) {
    router.get('/robots.txt', koaRobots(robots))
  }

  app.use(router.routes())

  return app
}
