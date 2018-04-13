export default (registry) => {
  return ctx => { ctx.body = registry.metrics() }
}
