import test from 'ava'
import td from 'testdouble'

import check from './check'

test.beforeEach(t => {
  t.context.log = td.object(['fatal'])
  t.context.nextPromise = Promise.resolve()
  t.context.next = () => t.context.nextPromise
  t.context.ctx = {
    state: {
      log: t.context.log
    },
    request: {accepts: td.function()}
  }
  t.context.checks = [td.function(), td.function()]
})

test('runs checks', t => {
  const { ctx, next, nextPromise, checks } = t.context
  td.when(ctx.request.accepts('json')).thenReturn(true)
  const result = check({checks: t.context.checks})(ctx, next)
  t.is(ctx.status, 202)
  t.deepEqual(ctx.body, {accepted: true})
  t.is(result, nextPromise)
  td.verify(checks[0]())
  td.verify(checks[1]())
})

test('runs checks and returns text response', t => {
  const { ctx, next, nextPromise, checks } = t.context
  td.when(ctx.request.accepts('json')).thenReturn(false)
  const result = check({checks: t.context.checks})(ctx, next)
  t.is(ctx.status, 202)
  t.is(ctx.body, undefined)
  t.is(result, nextPromise)
  td.verify(checks[0]())
  td.verify(checks[1]())
})

test('runs checks from context', t => {
  const { ctx, next, nextPromise, checks } = t.context
  const doNotCall = td.function()
  ctx.state.checks = checks
  const result = check({checks: [doNotCall]})(ctx, next)
  t.is(ctx.status, 202)
  t.is(result, nextPromise)
  td.verify(checks[0]())
  td.verify(checks[1]())
  td.verify(doNotCall(), {times: 0, ignoreExtraArgs: true})
})

test('runs checks and logs error', t => {
  const err = new Error('fail')
  const { ctx, next, nextPromise, checks } = t.context
  const willFail = td.function()
  td.when(willFail()).thenReject(err)
  const result = check({checks: [...checks, willFail]})(ctx, next)
  t.is(ctx.status, 202)
  t.is(result, nextPromise)
  td.verify(checks[0]())
  td.verify(checks[1]())
})
