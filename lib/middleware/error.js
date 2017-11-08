import { wrap } from 'boom'

export default ({
  log,
  logError = true,
  includeStack = false,
  requestIdParamName = 'id'
} = {}) => async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    const error = wrap(err)
    const status = error.output.statusCode
    const body = {
      ...error.output.payload,
      data: error.data,
      status,
      stack: includeStack ? error.stack : undefined
    }

    err.expose = true
    err.status = status
    err.body = body

    ctx.status = status
    ctx.body = {error: body}

    ctx.app.emit('error', err, ctx)
  }
}
