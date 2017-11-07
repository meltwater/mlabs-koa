import uuid from 'uuid'

const headerName = 'x-request-id'

export default ({
  resHeader = headerName,
  reqHeader = headerName,
  paramName = 'id',
  generator = uuid
} = {}) => (ctx, next) => {
  const key = paramName
  const id = ctx[key] || ctx.get(reqHeader) || ctx.query[key] || generator()
  ctx[key] = id
  ctx.set(resHeader, id)
  next()
}
