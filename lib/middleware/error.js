import Boom, {
  boomify,
  isBoom,
  badRequest,
  unauthorized,
  paymentRequired,
  forbidden,
  notFound,
  methodNotAllowed,
  notAcceptable,
  proxyAuthRequired,
  clientTimeout,
  conflict,
  resourceGone,
  lengthRequired,
  preconditionFailed,
  entityTooLarge,
  uriTooLong,
  unsupportedMediaType,
  rangeNotSatisfiable,
  expectationFailed,
  teapot,
  badData,
  locked,
  preconditionRequired,
  tooManyRequests,
  illegal,
  badImplementation,
  notImplemented,
  badGateway,
  serverUnavailable,
  gatewayTimeout
} from 'boom'
import {
  always,
  propOr,
  both,
  gt,
  lte,
  either,
  propEq,
  isNilOrEmpty,
  isString
} from '@meltwater/phi'

const boomErrors = {
  400: badRequest,
  401: unauthorized,
  402: paymentRequired,
  403: forbidden,
  404: notFound,
  405: methodNotAllowed,
  406: notAcceptable,
  407: proxyAuthRequired,
  408: clientTimeout,
  409: conflict,
  410: resourceGone,
  411: lengthRequired,
  412: preconditionFailed,
  413: entityTooLarge,
  414: uriTooLong,
  415: unsupportedMediaType,
  416: rangeNotSatisfiable,
  417: expectationFailed,
  418: teapot,
  422: badData,
  423: locked,
  424: 'Failed Dependency',
  425: 'Unordered Collection',
  426: 'Upgrade Required',
  428: preconditionRequired,
  429: tooManyRequests,
  431: 'Request Header Fields Too Large',
  451: illegal,
  500: badImplementation,
  501: notImplemented,
  502: badGateway,
  503: serverUnavailable,
  504: gatewayTimeout,
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  509: 'Bandwidth Limit Exceeded',
  510: 'Not Extended',
  511: 'Network Authentication Required'
}

export const isErrorCode = both(lte(400), gt(600))

export const createError = statusCode => {
  const error = propOr('Unknown Error', statusCode, boomErrors)
  return isString(error) ? new Boom(error, {statusCode}) : error()
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
