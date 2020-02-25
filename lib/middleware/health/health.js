import { either, isNull } from '@meltwater/phi'

export default ({ healthy = () => true, status = () => null } = {}) => async (
  ctx,
  next
) => {
  const data = await status()
  const props = { isHealthLog: true, isAppLog: false }
  if (isNull(data)) ctx.state.log.warn(props, 'Health: Unknown')
  ctx.state.isHealthy = either(isNull, healthy)(data)
  return next()
}
