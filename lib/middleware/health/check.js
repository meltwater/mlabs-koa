import { defaultTo } from '@meltwater/phi'

export default ({
  checks = []
} = {}) => {
  const doCheck = log => async check => {
    try {
      await check()
    } catch (err) {
      log.fatal({err}, 'Health Check: Fatal')
    }
  }

  return (ctx, next) => {
    ctx.status = 202
    defaultTo(checks, ctx.state.checks).map(doCheck(ctx.state.log))

    const sendJson = ctx.request.get('accept') && ctx.request.accepts('json')
    if (sendJson) ctx.body = {accepted: true}

    return next()
  }
}
