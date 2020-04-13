import test from 'ava'

import metrics from './metrics'

test.beforeEach((t) => {
  t.context.ctx = {}
  t.context.registry = { metrics: () => 'foobar' }
})

test('responds with metrics', async (t) => {
  const { ctx } = t.context
  await metrics(t.context.registry)(ctx)
  t.is(ctx.body, 'foobar')
})
