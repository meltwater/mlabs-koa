import test from 'ava'
import td from 'testdouble'

import healthy from './healthy'

test.beforeEach(t => {
  t.context.nextPromise = Promise.resolve()
  t.context.next = () => t.context.nextPromise
  t.context.ctx = {
    request: {accepts: td.function()}
  }
})

test('returns healthy', async t => {
  const { ctx, next, nextPromise } = t.context
  td.when(ctx.request.accepts('json')).thenReturn(true)
  const result = healthy()(ctx, next)
  t.is(ctx.status, 200)
  t.deepEqual(ctx.body, {healthy: true})
  t.is(result, nextPromise)
})

test('returns unhealthy', async t => {
  const { ctx, next, nextPromise } = t.context
  td.when(ctx.request.accepts('json')).thenReturn(true)
  const result = healthy({isHealthy: false})(ctx, next)
  t.is(ctx.status, 503)
  t.deepEqual(ctx.body, {healthy: false})
  t.is(result, nextPromise)
})

test('returns healthy text response', async t => {
  const { ctx, next, nextPromise } = t.context
  td.when(ctx.request.accepts('json')).thenReturn(false)
  const result = healthy({isHealthy: true})(ctx, next)
  t.is(ctx.status, 200)
  t.is(ctx.body, undefined)
  t.is(result, nextPromise)
})

test('returns unhealthy text response', async t => {
  const { ctx, next, nextPromise } = t.context
  td.when(ctx.request.accepts('json')).thenReturn(false)
  const result = healthy({isHealthy: false})(ctx, next)
  t.is(ctx.status, 503)
  t.is(ctx.body, undefined)
  t.is(result, nextPromise)
})
