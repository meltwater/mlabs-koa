import { isNil } from '@meltwater/phi'

export default ({
  isHealthy = true
} = {}) => (ctx, next) => {
  if (isNil(ctx.state.isHealthy)) ctx.state.isHealthy = isHealthy
  ctx.status = ctx.state.isHealthy ? 200 : 503

  const sendJson = ctx.request.get('accept') && ctx.request.accepts('json')
  if (sendJson) ctx.body = {healthy: ctx.state.isHealthy}

  return next()
}
