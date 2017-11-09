export default ({
  isHealthy = true,
  setBody = true
} = {}) => (ctx, next) => {
  ctx.status = isHealthy ? 200 : 503

  if (!setBody) return next()

  if (ctx.request.accepts('json')) {
    ctx.body = {healthy: isHealthy}
  }
}
