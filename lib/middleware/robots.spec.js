import test from 'ava'

import robots from './robots'

test.beforeEach(t => {
  t.context.ctx = {}
})

test('disallows robots', t => {
  const { ctx } = t.context
  robots()(ctx)
  t.is(ctx.body, 'User-agent: *\nDisallow: /\n')
})

test('takes custom rules', t => {
  const { ctx } = t.context
  robots({
    rule: 'foo',
    rules: {foo: ['a', 'b']}
  })(ctx)
  t.is(ctx.body, 'a\nb\n')
})

test('checks arguments', t => {
  const msg = /Robots middleware/
  t.throws(() => robots({rules: 3}), msg, 'when bad rules')
  t.throws(() => robots({rule: 3}), msg, 'when bad rule')
  t.throws(() => robots({rule: 'foo', rules: {foo: 'b'}}), msg, 'when bad rule')
  t.throws(() => robots({rule: 'bar', rules: {foo: ['a', 'b']}}), msg, 'when missing rule')
})
