import Router from 'koa-router'
import {
  compose,
  isNil,
  map,
  propOr,
  toPairs,
  values
} from '@meltwater/phi'

import { koaCheck, koaHealth, koaHealthy } from '../middleware/health'

export default ({
  log,
  healthMethods = {healthy: () => true},
  healthMonitor
} = {}) => {
  if (isNil(healthMonitor)) {
    throw new Error("Health router: missing 'healthMonitor'.")
  }

  const allChecks = map(compose(
    check => () => check({log}),
    propOr(() => {}, 'emit'),
    propOr({}, 'events'))
  )(values(healthMonitor))

  const router = new Router()

  for (const [ id, health ] of toPairs(healthMonitor)) {
    const isHealth = id === 'health'
    const path = isHealth ? '/' : `/${id}`

    const checks = isHealth
      ? allChecks
      : [() => health.events.emit({log})]

    const healthy = propOr(healthMethods.health, id, healthMethods)
    const status = health.status

    router.get(
      path,
      koaCheck({log, checks}),
      koaHealth({log, healthy, status}),
      koaHealthy()
    )
  }

  return router
}
