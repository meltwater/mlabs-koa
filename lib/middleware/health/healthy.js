import { isNil } from '@meltwater/phi'

export default ({
  isHealthy = true
} = {}) => (ctx, next) => {
  if (isNil(ctx.state.isHealthy)) ctx.state.isHealthy = isHealthy
  ctx.status = ctx.state.isHealthy ? 200 : 503

  if (ctx.request.accepts('json')) {
    ctx.body = {healthy: ctx.state.isHealthy}
  }

  return next()
}
