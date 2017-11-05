import koaFavicon from 'koa-favicon'
import koaHelmet from 'koa-helmet'

export default ({app, config}) => {
  const {
    helmet,
    favicon = null
  } = config

  app.use(koaHelmet(helmet))
  if (favicon) app.use(koaFavicon(favicon))

  return app
}
