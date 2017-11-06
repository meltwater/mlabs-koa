import koaFavicon from 'koa-favicon'
import koaHelmet from 'koa-helmet'
import koaRouter from 'koa-router'

import {
  koaRobots
} from './middleware'

export default ({app, config = {}} = {}) => {
  const {
    helmet,
    robots = {},
    favicon = {}
  } = config

  const router = koaRouter()

  app.use(koaHelmet(helmet))

  if (favicon.path) {
    app.use(koaFavicon(favicon.path, favicon))
  }

  if (!robots.disable) {
    router.get('/robots.txt', koaRobots(robots))
  }

  app.use(router.routes())

  return app
}
