import Router from 'koa-router'
import {
  isNil
} from '@meltwater/phi'

export default ({
  healthMonitor
} = {}) => {
  if (isNil(healthMonitor)) {
    throw new Error("Health router: missing 'healthMonitor'.")
  }

  const router = new Router()

  return router
}
