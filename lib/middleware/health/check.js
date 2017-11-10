import { defaultTo } from '@meltwater/phi'

export default ({
  log,
  checks = []
} = {}) => {
  const doCheck = async check => {
    try {
      await check()
    } catch (err) {
      log.fatal({err}, 'Health Check: Fatal')
    }
  }

  return (ctx, next) => {
    ctx.status = 202
    defaultTo(checks, ctx.state.checks).map(doCheck)

    if (ctx.request.accepts('json')) {
      ctx.body = {accepted: true}
    }

    return next()
  }
}
