export const log = ({
  addHttp = true,
  requestIdParamName = 'reqId'
} = {}) => (ctx, next) => {
  const { state, request: { method, baseUrl, url } } = ctx

  const props = {
    reqId: state[requestIdParamName]
  }

  if (addHttp) {
    const originalUrl = [baseUrl, url].join('')
    props.http = {url: originalUrl, method}
  }

  ctx.state.logHttp = addHttp ? props.http : {}
  ctx.state.log = ctx.state.log.child(props)
  return next()
}

export default ({
  resTimeHeader = 'x-request-time',
  level = 'info'
} = {}) => async (ctx, next) => {
  ctx.state.log[level]('Request: Start')
  await next()
  const resTime = parseInt(ctx.get(resTimeHeader))
  const resSize = ctx.response.length
  ctx.state.log = ctx.state.log.child({http: {
    ...ctx.state.logHttp,
    ...(resTime ? {resTime} : {}),
    resSize
  }})
  ctx.state.log[level]('Request: Success')
}
