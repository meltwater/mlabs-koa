import Router from 'koa-router'
import {
  isNil
} from '@meltwater/phi'

export default ({
  healthMonitor
} = {}) => {
  if (isNil(healthMonitor)) {
    throw new Error("Status router: missing 'healthMonitor'.")
  }

  const router = new Router()

  return router
}
