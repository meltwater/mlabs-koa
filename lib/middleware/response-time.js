import { isNonEmptyString } from '@meltwater/phi'

const errPrefix = 'Response time middleware:'

export default ({
  resHeader = 'x-response-time'
} = {}) => {
  if (!isNonEmptyString(resHeader)) {
    throw new Error(`${errPrefix} option 'resHeader' must be string, got ${typeof resHeader}.`)
  }

  return async (ctx, next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    ctx.set(resHeader, `${ms}ms`)
  }
}
