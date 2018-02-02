import { isNonEmptyString } from '@meltwater/phi'

const errPrefix = 'Logger middleware:'

const addProp = (k, v) => isNonEmptyString(v) ? {[k]: v} : {}

export const log = ({
  addReq = true,
  reqNameHeader = 'x-request-name',
  requestIdParamName = 'reqId'
} = {}) => (ctx, next) => {
  ctx.state.log = ctx.state.log.child({
    serializers: {res: res => res},
    ...addProp('reqId', ctx.state[requestIdParamName]),
    ...addProp('reqName', ctx.get(reqNameHeader)),
    ...(addReq ? {req: ctx.request} : {})
  })

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

    ctx.state.log[level]({req: ctx.request}, 'Request: Start')

    await next()

    const res = {
      time: Date.now() - start,
      size: ctx.response.length,
      headers: ctx.response.headers,
      statusCode: ctx.response.status
    }

    ctx.state.log[level]({res}, 'Request: End')
  }
}
