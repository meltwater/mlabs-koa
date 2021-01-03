import test from 'ava'
import * as td from 'testdouble'

import health from './health.js'

const logProps = { isHealthLog: true, isAppLog: false }

test.beforeEach((t) => {
  t.context.log = td.object(['warn'])
  t.context.nextPromise = Promise.resolve('next')
  t.context.next = () => t.context.nextPromise
  t.context.ctx = {
    state: {
      log: t.context.log
    }
  }
})

test('sets health in state', async (t) => {
  const { ctx, next, nextPromise } = t.context
  const result = await health()(ctx, next)
  t.true(ctx.state.isHealthy)
  t.is(result, await nextPromise)
  td.verify(t.context.log.warn(logProps, 'Health: Unknown'))
})

test('warns on null status', async (t) => {
  const { ctx, next, nextPromise } = t.context
  const result = await health({ status: () => null })(ctx, next)
  t.true(ctx.state.isHealthy)
  t.is(result, await nextPromise)
  td.verify(t.context.log.warn(logProps, 'Health: Unknown'))
})

test('sets health in state using status and healthy', async (t) => {
  const { ctx, next, nextPromise } = t.context
  const result = await health({
    healthy: (x) => x === 'foo',
    status: () => 'foo'
  })(ctx, next)
  t.true(ctx.state.isHealthy)
  t.is(result, await nextPromise)
  td.verify(t.context.log.warn('Health: Unknown'), {
    times: 0,
    ignoreExtraArgs: true
  })
})
