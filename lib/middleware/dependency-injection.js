import { asValue } from 'awilix'

export default ({ requestIdParamName = 'reqId' } = {}) =>
  (ctx, next) => {
    ctx.state.container.register({
      reqId: asValue(ctx.state[requestIdParamName]),
      log: asValue(ctx.state.log)
    })

    return next()
  }
