import {
  either,
  isNull
} from '@meltwater/phi'

export default ({
  log,
  healthy = () => true,
  status = () => null
} = {}) => async (ctx, next) => {
  const data = await status()
  if (isNull(data)) log.warn('Health: Unknown')
  ctx.state.isHealthy = either(isNull, healthy)(data)
  return next()
}
