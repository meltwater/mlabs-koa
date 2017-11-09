export default ({
  isHealthy = true
} = {}) => (ctx, next) => {
  ctx.status = isHealthy ? 200 : 503

  if (ctx.request.accepts('json')) {
    ctx.body = {healthy: isHealthy}
  }
}
