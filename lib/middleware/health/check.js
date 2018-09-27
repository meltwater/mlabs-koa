import { defaultTo } from '@meltwater/phi'

export default ({
  wait = false,
  checks = []
} = {}) => {
  const doCheck = log => async check => {
    try {
      await check()
    } catch (err) {
      log.fatal({ err }, 'Health Check: Fatal')
    }
  }

  return async (ctx, next) => {
    const allChecks = defaultTo(checks, ctx.state.checks)
    const checksP = allChecks.map(doCheck(ctx.state.log))

    if (wait) await Promise.all(checksP)

    const sendJson = ctx.request.get('accept') && ctx.request.accepts('json')
    if (sendJson) ctx.body = { accepted: true }

    ctx.status = 202
    return next()
  }
}
