import koaFavicon from 'koa-favicon'

export default ({app, config}) => {
  const {
    favicon = null
  } = config

  if (favicon) app.use(koaFavicon(favicon))

  return app
}
