import koaFavicon from 'koa-favicon'
import koaHelmet from 'koa-helmet'
import koaRouter from 'koa-router'
import { both, propEq, propSatisfies, isObj, isString } from '@meltwater/phi'

import {
  koaRobots
} from './middleware'

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

  if (both(isObj, propSatisfies(isString, 'path'))(favicon)) {
    app.use(koaFavicon(favicon.path, favicon))
  }

  if (!both(isObj, propEq('disable', true))(robots)) {
    router.get('/robots.txt', koaRobots(robots))
  }

  app.use(router.routes())

  return app
}
