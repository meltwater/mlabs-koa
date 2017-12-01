import { isNonEmptyString } from '@meltwater/phi'

const errPrefix = 'Response time middleware:'

export default ({
  resHeader = 'x-response-time'
} = {}) => async (ctx, next) => {
  if (!isNonEmptyString(resHeader)) {
    throw new Error(`${errPrefix} option 'resHeader' must be string, got ${typeof resHeader}.`)
  }
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set(resHeader, `${ms}ms`)
}
