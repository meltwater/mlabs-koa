import test from 'ava'
import td from 'testdouble'

import healthy from './healthy'

test.beforeEach(t => {
  t.context.ctx = {
    request: {accepts: td.function()}
  }
})

test('returns healthy', async t => {
  const { ctx } = t.context
  td.when(ctx.request.accepts('json')).thenReturn(true)
  await healthy()(ctx)
  t.is(ctx.status, 200)
  t.deepEqual(ctx.body, {healthy: true})
})

test('returns unhealthy', async t => {
  const { ctx } = t.context
  td.when(ctx.request.accepts('json')).thenReturn(true)
  await healthy({isHealthy: false})(ctx)
  t.is(ctx.status, 503)
  t.deepEqual(ctx.body, {healthy: false})
})

test('returns healthy and does not set body', async t => {
  const nextPromise = Promise.resolve()
  const next = () => nextPromise
  const { ctx } = t.context

  td.when(ctx.request.accepts('json')).thenReturn(true)
  const result = healthy({isHealthy: true, setBody: false})(ctx, next)
  t.is(ctx.status, 200)
  t.is(ctx.body, undefined)
  t.is(result, nextPromise)
})

test('returns unhealthy and does not set body', async t => {
  const nextPromise = Promise.resolve()
  const next = () => nextPromise
  const { ctx } = t.context

  td.when(ctx.request.accepts('json')).thenReturn(true)
  const result = healthy({isHealthy: false, setBody: false})(ctx, next)
  t.is(ctx.status, 503)
  t.is(ctx.body, undefined)
  t.is(result, nextPromise)
})

test('returns healthy text response', async t => {
  const nextPromise = Promise.resolve()
  const next = () => nextPromise
  const { ctx } = t.context

  td.when(ctx.request.accepts('json')).thenReturn(false)
  healthy({isHealthy: true})(ctx, next)
  t.is(ctx.status, 200)
  t.is(ctx.body, undefined)
})

test('returns unhealthy text response', async t => {
  const nextPromise = Promise.resolve()
  const next = () => nextPromise
  const { ctx } = t.context

  td.when(ctx.request.accepts('json')).thenReturn(false)
  healthy({isHealthy: false})(ctx, next)
  t.is(ctx.status, 503)
  t.is(ctx.body, undefined)
})
