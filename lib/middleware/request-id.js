import uuid from 'uuid'
import { isNonEmptyString } from '@meltwater/phi'

const errPrefix = 'Request ID middleware:'
const headerName = 'x-request-id'

const argStringErr = (arg, name) => (
  new Error(`${errPrefix} option '${name}' must be string, got ${typeof arg}.`)
)

export default ({
  resHeader = headerName,
  reqHeader = headerName,
  paramName = 'id',
  generator = uuid
} = {}) => {
  if (!isNonEmptyString(reqHeader)) throw argStringErr(reqHeader, 'reqHeader')
  if (!isNonEmptyString(resHeader)) throw argStringErr(resHeader, 'resHeader')
  if (!isNonEmptyString(paramName)) throw argStringErr(paramName, 'paramName')

  return async (ctx, next) => {
    const key = paramName
    const id = ctx.state[key] || ctx.get(reqHeader) || ctx.query[key] || generator()
    ctx.state[key] = id
    ctx.set(resHeader, id)
    await next()
  }
}
