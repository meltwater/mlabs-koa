import test from 'ava'
import td from 'testdouble'

import health from './health'

test.beforeEach(t => {
  t.context.log = td.object(['warn'])
  t.context.nextPromise = Promise.resolve('next')
  t.context.next = () => t.context.nextPromise
  t.context.ctx = {
    state: {}
  }
})

test('sets health in state', async t => {
  const { ctx, next, nextPromise, log } = t.context
  const result = await health({log})(ctx, next)
  t.true(ctx.state.isHealthy)
  t.is(result, await nextPromise)
  td.verify(t.context.log.warn('Health: Unknown'))
})

test('warns on null status', async t => {
  const { ctx, next, nextPromise, log } = t.context
  const result = await health({log, status: () => null})(ctx, next)
  t.true(ctx.state.isHealthy)
  t.is(result, await nextPromise)
  td.verify(t.context.log.warn('Health: Unknown'))
})

test('sets health in state using status and healthy', async t => {
  const { ctx, next, nextPromise, log } = t.context
  const result = await health({
    healthy: x => x === 'foo',
    status: () => 'foo',
    log
  })(ctx, next)
  t.true(ctx.state.isHealthy)
  t.is(result, await nextPromise)
  td.verify(t.context.log.warn('Health: Unknown'), {times: 0, ignoreExtraArgs: true})
})