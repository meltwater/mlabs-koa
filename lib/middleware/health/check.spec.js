import test from 'ava'
import td from 'testdouble'

import check from './check'

test.beforeEach(t => {
  t.context.log = td.object(['fatal'])
  t.context.nextPromise = Promise.resolve('next')
  t.context.next = () => t.context.nextPromise
  t.context.ctx = {
    state: {
      log: t.context.log
    },
    request: { get: td.function(), accepts: td.function() }
  }
  t.context.checks = [td.function(), td.function()]
})

test('runs checks', async t => {
  const { ctx, next, nextPromise, checks } = t.context
  td.when(ctx.request.get('accept')).thenReturn('*/*')
  td.when(ctx.request.accepts('json')).thenReturn(true)
  const result = await check({ checks: t.context.checks })(ctx, next)
  t.is(ctx.status, 202)
  t.deepEqual(ctx.body, { accepted: true })
  t.is(result, await nextPromise)
  td.verify(checks[0]())
  td.verify(checks[1]())
})

test('runs checks and does not wait', async t => {
  const { ctx, next, nextPromise } = t.context
  td.when(ctx.request.get('accept')).thenReturn('*/*')
  td.when(ctx.request.accepts('json')).thenReturn(true)
  const checks = [() => new Promise(() => {})]
  const result = await check({ checks, wait: false })(ctx, next)
  t.is(ctx.status, 202)
  t.deepEqual(ctx.body, { accepted: true })
  t.is(result, await nextPromise)
})

test('runs checks and waits', async t => {
  const { ctx, next, nextPromise } = t.context
  td.when(ctx.request.get('accept')).thenReturn('*/*')
  td.when(ctx.request.accepts('json')).thenReturn(true)

  const f = td.function()
  const checks = [() => new Promise((resolve, reject) => {
    f()
    resolve()
  })]

  const result = await check({ checks, wait: true })(ctx, next)
  t.is(ctx.status, 202)
  t.deepEqual(ctx.body, { accepted: true })
  t.is(result, await nextPromise)
  td.verify(f())
})

test('runs checks and returns text response', async t => {
  const { ctx, next, nextPromise, checks } = t.context
  td.when(ctx.request.get('accept')).thenReturn('*/*')
  td.when(ctx.request.accepts('json')).thenReturn(false)
  const result = await check({ checks: t.context.checks })(ctx, next)
  t.is(ctx.status, 202)
  t.is(ctx.body, undefined)
  t.is(result, await nextPromise)
  td.verify(checks[0]())
  td.verify(checks[1]())
})

test('runs checks and returns text response when no accept header', async t => {
  const { ctx, next, nextPromise, checks } = t.context
  td.when(ctx.request.get('accept')).thenReturn(undefined)
  td.when(ctx.request.accepts('json')).thenReturn(false)
  const result = await check({ checks: t.context.checks })(ctx, next)
  t.is(ctx.status, 202)
  t.is(ctx.body, undefined)
  t.is(result, await nextPromise)
  td.verify(checks[0]())
  td.verify(checks[1]())
})

test('runs checks from context', async t => {
  const { ctx, next, nextPromise, checks } = t.context
  const doNotCall = td.function()
  ctx.state.checks = checks
  const result = await check({ checks: [doNotCall] })(ctx, next)
  t.is(ctx.status, 202)
  t.is(result, await nextPromise)
  td.verify(checks[0]())
  td.verify(checks[1]())
  td.verify(doNotCall(), { times: 0, ignoreExtraArgs: true })
})

test('runs checks and logs error', async t => {
  const err = new Error('fail')
  const { ctx, next, nextPromise, checks } = t.context
  const willFail = td.function()
  td.when(willFail()).thenReject(err)
  const result = await check({ checks: [...checks, willFail] })(ctx, next)
  t.is(ctx.status, 202)
  t.is(result, await nextPromise)
  td.verify(checks[0]())
  td.verify(checks[1]())
})
