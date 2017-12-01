import {
  either,
  isNull
} from '@meltwater/phi'

export default ({
  healthy = () => true,
  status = () => null
} = {}) => async (ctx, next) => {
  const data = await status()
  if (isNull(data)) ctx.state.log.warn('Health: Unknown')
  ctx.state.isHealthy = either(isNull, healthy)(data)
  return next()
}
