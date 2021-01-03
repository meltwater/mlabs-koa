import test from 'ava'
import * as td from 'testdouble'

import ready from './ready.js'

test.beforeEach((t) => {
  t.context.nextPromise = Promise.resolve()
  t.context.next = () => t.context.nextPromise
  t.context.ctx = {
    state: {}
  }
})

test('handles undefined health', async (t) => {
  const { ctx, next, nextPromise } = t.context
  const updateHealthStatus = td.function()
  const getReadyStatus = td.function()

  td.when(getReadyStatus()).thenReturn(true)
  const result = ready({ getReadyStatus, updateHealthStatus })(ctx, next)
  t.deepEqual(ctx.state, { isHealthy: true })
  t.is(result, nextPromise)
  td.verify(updateHealthStatus(true))
})

test('handles true health', async (t) => {
  const { ctx, next, nextPromise } = t.context
  const updateHealthStatus = td.function()
  const getReadyStatus = td.function()

  t.context.ctx.state.isHealthy = true
  td.when(getReadyStatus()).thenReturn(true)
  const result = ready({ getReadyStatus, updateHealthStatus })(ctx, next)
  t.deepEqual(ctx.state, { isHealthy: true })
  t.is(result, nextPromise)
  td.verify(updateHealthStatus(true))
})

test('handles false health', async (t) => {
  const { ctx, next, nextPromise } = t.context
  const updateHealthStatus = td.function()
  const getReadyStatus = td.function()

  td.when(getReadyStatus()).thenReturn(false)

  t.context.ctx.state.isHealthy = false
  const result = ready({ getReadyStatus, updateHealthStatus })(ctx, next)
  t.deepEqual(ctx.state, { isHealthy: false })
  t.is(result, nextPromise)
  td.verify(updateHealthStatus(false))
})
