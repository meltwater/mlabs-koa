import { asValue } from 'awilix'

export default ({
  requestIdParamName = 'id'
} = {}) => (ctx, next) => {
  const { state, request: { method, baseUrl, url } } = ctx
  const { container } = state

  const reqId = state[requestIdParamName]

  const originalUrl = [baseUrl, url].join('')
  const http = {url: originalUrl, method}

  const log = container.resolve('log').child({reqId, http})

  ctx.state.log = log

  container.register({
    reqId: asValue(reqId),
    log: asValue(log)
  })

  return next()
}
