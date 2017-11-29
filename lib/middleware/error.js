import { boomify, notFound } from 'boom'
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
      const error = boomify(err, {override: false})

      err.expose = exposeError(error)

      const status = error.output.statusCode
      const body = {
        ...error.output.payload,
        ...(setMessage(error) ? {message: err.message} : {}),
        data: error.data,
        status
      }

      err.status = status
      err.body = body

      ctx.status = status
      ctx.body = body

      ctx.app.emit('error', err, ctx)
    }
  }
}
