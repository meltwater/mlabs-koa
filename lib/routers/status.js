import Router from '@koa/router'
import {
  isNil,
  toPairs
} from '@meltwater/phi'

import { koaStatus } from '../middleware/health'

export default ({
  healthMonitor
} = {}) => {
  if (isNil(healthMonitor)) {
    throw new Error("Status router: missing 'healthMonitor'.")
  }

  const router = new Router()

  for (const [id, health] of toPairs(healthMonitor)) {
    const isHealth = id === 'health'
    const path = isHealth ? '/' : `/${id}`
    router.get(path, koaStatus({ status: health.status }))
  }

  return router
}
