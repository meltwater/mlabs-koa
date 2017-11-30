import { boomify, isBoom, notFound } from 'boom'
import {
  always,
  both,
  either,
  propEq
} from '@meltwater/phi'

export default ({
  isServerErrorExposed = true
} = {}) => {
  const isExposed = always(isServerErrorExposed)
  const exposeError = either(isExposed, propEq('isServer', false))
  const setMessage = both(isExposed, propEq('isServer', true))

  return async (ctx, next) => {
    try {
      await next()
      if (ctx.status === 404) throw notFound()
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
      ctx.body = body

      ctx.app.emit('error', err, ctx)
    }
  }
}
