import minimatch from 'minimatch'
import koaCors from '@koa/cors'
import { any, isNil } from '@meltwater/phi'

export default ({ origins, ...options } = {}) =>
  koaCors({
    ...options,
    ...(isNil(origins) ? {} : { origin: matchOrigin(origins) })
  })

export const matchOrigin = (origins = []) => (ctx) => {
  const origin = ctx.request.get('origin')
  const isValidOrigin = any((glob) => minimatch(origin, glob), origins)
  return isValidOrigin ? origin : null
}
