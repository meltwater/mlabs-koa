export default ({
  resHeader = 'x-response-time'
} = {}) => async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set(resHeader, `${ms}ms`)
}
