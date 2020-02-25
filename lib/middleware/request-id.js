import { v4 as uuidv4 } from 'uuid'
import { isNonEmptyString } from '@meltwater/phi'

const errPrefix = 'Request id middleware:'
const headerName = 'x-request-id'

const argStringErr = (arg, name) =>
  new Error(`${errPrefix} option '${name}' must be string, got ${typeof arg}.`)

export default ({
  resHeader = headerName,
  reqHeader = headerName,
  paramName = 'reqId',
  generator = uuidv4
} = {}) => {
  if (!isNonEmptyString(reqHeader)) throw argStringErr(reqHeader, 'reqHeader')
  if (!isNonEmptyString(resHeader)) throw argStringErr(resHeader, 'resHeader')
  if (!isNonEmptyString(paramName)) throw argStringErr(paramName, 'paramName')

  return (ctx, next) => {
    const key = paramName
    const id = ctx.state[key] || ctx.get(reqHeader) || generator()
    ctx.state[key] = id
    ctx.set(resHeader, id)
    return next()
  }
}
