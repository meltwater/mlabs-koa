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
  healthMethods = {healthy: () => true},
  healthMonitor
} = {}) => {
  if (isNil(healthMonitor)) {
    throw new Error("Health router: missing 'healthMonitor'.")
  }

  const allChecks = map(compose(
    check => container => check(container),
    propOr(() => {}, 'emit'),
    propOr({}, 'events'))
  )(values(healthMonitor))

  const router = new Router()

  for (const [ id, health ] of toPairs(healthMonitor)) {
    const isHealth = id === 'health'
    const path = isHealth ? '/' : `/${id}`

    const checks = isHealth
      ? allChecks
      : [container => health.events.emit(container)]

    const healthy = propOr(healthMethods.health, id, healthMethods)
    const status = health.status

    const injectChecks = checks => (ctx, next) => {
      const { container } = ctx.state
      ctx.state.checks = checks.map(check => () => check(container))
      return next()
    }

    router.get(
      path,
      injectChecks(checks),
      koaCheck(),
      koaHealth({healthy, status}),
      koaHealthy()
    )
  }

  return router
}
