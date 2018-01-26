import Boom, {
  boomify,
  isBoom,
  notFound
} from 'boom'
import {
  always,
  propOr,
  both,
  gt,
  lte,
  either,
  propEq,
  isNilOrEmpty
} from '@meltwater/phi'

const boomErrors = {
  404: notFound
}

export const isErrorCode = both(lte(400), gt(600))

export const createError = statusCode => {
  const createBoomError = propOr(
    () => new Boom('Unknown Error', {statusCode}),
    statusCode,
    boomErrors
  )
  return createBoomError()
}

export default ({
  isServerErrorExposed = true
} = {}) => {
  const isExposed = always(isServerErrorExposed)
  const exposeError = either(isExposed, propEq('isServer', false))
  const setMessage = both(isExposed, propEq('isServer', true))

  return async (ctx, next) => {
    try {
      await next()
      const statusCode = parseInt(ctx.status)
      if (isErrorCode(statusCode)) throw createError(statusCode)
    } catch (err) {
      const isBoomError = isBoom(err)
      boomify(err)

      err.expose = exposeError(err)

      const status = err.output.statusCode
      const body = {
        ...err.output.payload,
        ...(setMessage(err) ? {message: err.message} : {}),
        data: isBoomError ? err.data : null,
        status
      }

      ctx.status = status
      if (isNilOrEmpty(ctx.body)) ctx.body = body

      ctx.app.emit('error', err, ctx)
    }
  }
}
