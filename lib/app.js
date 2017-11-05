import koaFavicon from 'koa-favicon'

export default ({app, config}) => {
  const {
    favicon
  } = config

  if (favicon) app.use(koaFavicon(favicon))

  return app
}
