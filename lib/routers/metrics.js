export default (registry) => {
  return async (ctx) => {
    ctx.body = await registry.metrics()
  }
}
