export default ({ updateHealthStatus, getReadyStatus } = {}) =>
  (ctx, next) => {
    const isHealthy = ctx.state.isHealthy !== false
    updateHealthStatus(isHealthy)
    ctx.state.isHealthy = getReadyStatus()
    return next()
  }
