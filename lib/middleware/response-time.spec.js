import test from 'ava'
import * as td from 'testdouble'

import responseTime from './response-time.js'

test.beforeEach((t) => {
  t.context.ctx = {
    set: td.func()
  }
})

test('logs request', async (t) => {
  const { ctx } = t.context
  const next = async () => {}
  await responseTime({ resHeader: 'x-res-time' })(ctx, next)
  td.verify(ctx.set('x-res-time', td.matchers.contains(/\d+ms/)))
  t.pass()
})

test('checks arguments', (t) => {
  const err = { message: /Response time middleware/ }
  t.throws(
    () => responseTime({ resHeader: '' }),
    err,
    'when bad response header'
  )
})
