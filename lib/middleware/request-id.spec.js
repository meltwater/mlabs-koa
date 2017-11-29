import test from 'ava'
import td from 'testdouble'

import requestId from './request-id'

test.beforeEach(t => {
  t.context.ctx = {
    get: td.function(),
    set: td.function(),
    state: {}
  }
  t.context.next = td.function()
})

test('sets request id', t => {
  const { ctx, next } = t.context
  requestId({generator: () => 'foo'})(ctx, next)
  td.verify(ctx.set('x-request-id', 'foo'))
  td.verify(next())
  t.is(ctx.state.id, 'foo')
})

test('sets request id from context', t => {
  const { ctx, next } = t.context
  ctx.state.id = 'bar'
  td.when(ctx.get('x-request-id')).thenReturn('hbar')
  requestId({generator: () => 'foo'})(ctx, next)
  td.verify(ctx.set('x-request-id', 'bar'))
  td.verify(next())
  t.is(ctx.state.id, 'bar')
})

test('sets request id from header', t => {
  const { ctx, next } = t.context
  td.when(ctx.get('x-request-id')).thenReturn('hbar')
  requestId({generator: () => 'foo'})(ctx, next)
  td.verify(ctx.set('x-request-id', 'hbar'))
  td.verify(next())
  t.is(ctx.state.id, 'hbar')
})

test('checks arguments', t => {
  const msg = /Request ID middleware/
  t.throws(() => requestId({reqHeader: ''}), msg, 'when bad req header')
  t.throws(() => requestId({resHeader: 44}), msg, 'when bad res header')
  t.throws(() => requestId({paramName: 3}), msg, 'when bad param name')
})
