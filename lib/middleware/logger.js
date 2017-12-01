import { isNil, isNonEmptyString } from '@meltwater/phi'

const errPrefix = 'Logger middleware:'

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
  level = 'info'
} = {}) => {
  if (!isNonEmptyString(level)) {
    throw new Error(`${errPrefix} option 'level' must be string, got ${typeof level}.`)
  }

  return async (ctx, next) => {
    const start = Date.now()
    ctx.state.log[level]('Request: Start')
    await next()
    const resTime = Date.now() - start
    const resSize = ctx.response.length
    ctx.state.log = ctx.state.log.child({http: {
      ...ctx.state.logHttp,
      ...(isNil(resTime) ? {} : {resTime}),
      resSize
    }})
    ctx.state.log[level]('Request: End')
  }
}
