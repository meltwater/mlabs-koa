import test from 'ava'

import robots from './robots.js'

test.beforeEach((t) => {
  t.context.ctx = {}
})

test('disallows robots', async (t) => {
  const { ctx } = t.context
  await robots()(ctx)
  t.is(ctx.body, 'User-agent: *\nDisallow: /\n')
})

test('takes custom rules', async (t) => {
  const { ctx } = t.context
  await robots({
    rule: 'foo',
    rules: { foo: ['a', 'b'] }
  })(ctx)
  t.is(ctx.body, 'a\nb\n')
})

test('checks arguments', (t) => {
  const err = { message: /Robots router/ }
  t.throws(() => robots({ rules: 3 }), err, 'when bad rules')
  t.throws(() => robots({ rule: 3 }), err, 'when bad rule')
  t.throws(
    () => robots({ rule: 'foo', rules: { foo: 'b' } }),
    err,
    'when bad rule'
  )
  t.throws(
    () => robots({ rule: 'bar', rules: { foo: ['a', 'b'] } }),
    err,
    'when missing rule'
  )
})
