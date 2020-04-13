import test from 'ava'

import status from './status'

test.beforeEach((t) => {
  t.context.nextPromise = Promise.resolve('next')
  t.context.next = () => t.context.nextPromise
  t.context.ctx = {
    request: { query: { data: 'true' } }
  }
})

test('returns status', async (t) => {
  const { ctx, next, nextPromise } = t.context
  const result = await status()(ctx, next)
  t.is(ctx.status, 200)
  t.deepEqual(ctx.body, { data: null })
  t.is(result, await nextPromise)
})

test('returns status with simple data', async (t) => {
  const { ctx, next, nextPromise } = t.context
  const result = await status({ status: async () => 2 })(ctx, next)
  t.is(ctx.status, 200)
  t.deepEqual(ctx.body, { data: 2 })
  t.is(result, await nextPromise)
})

test('returns status with object data', async (t) => {
  const data = { foo: 'bar', error: new Error('fire'), date: new Date(393) }
  const { ctx, next, nextPromise } = t.context
  const result = await status({ status: () => data })(ctx, next)
  t.is(ctx.status, 200)
  t.deepEqual(ctx.body, {
    data: {
      foo: 'bar',
      error: 'fire',
      date: '1970-01-01T00:00:00.393Z'
    }
  })
  t.is(result, await nextPromise)
})

test('returns status with simple object data', async (t) => {
  const data = { foo: 'bar', error: 'fire', date: 393 }
  const { ctx, next, nextPromise } = t.context
  const result = await status({ status: () => data })(ctx, next)
  t.is(ctx.status, 200)
  t.deepEqual(ctx.body, {
    data: {
      foo: 'bar',
      error: 'fire',
      date: 393
    }
  })
  t.is(result, await nextPromise)
})
