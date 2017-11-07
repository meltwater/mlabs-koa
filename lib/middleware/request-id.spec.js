import test from 'ava'
import td from 'testdouble'

import requestId from './request-id'

test.beforeEach(t => {
  t.context.ctx = {
    get: td.function(),
    set: td.function(),
    query: {}
  }
  t.context.next = td.function()
})

test('sets request id', t => {
  const { ctx, next } = t.context
  requestId({generator: () => 'foo'})(ctx, next)
  td.verify(ctx.set('x-request-id', 'foo'))
  td.verify(next())
  t.is(ctx.id, 'foo')
})

test('sets request id from context', t => {
  const { ctx, next } = t.context
  ctx.id = 'bar'
  ctx.query.id = 'qbar'
  td.when(ctx.get('x-request-id')).thenReturn('hbar')
  requestId({generator: () => 'foo'})(ctx, next)
  td.verify(ctx.set('x-request-id', 'bar'))
  td.verify(next())
  t.is(ctx.id, 'bar')
})

test('sets request id from header', t => {
  const { ctx, next } = t.context
  ctx.query.id = 'qbar'
  td.when(ctx.get('x-request-id')).thenReturn('hbar')
  requestId({generator: () => 'foo'})(ctx, next)
  td.verify(ctx.set('x-request-id', 'hbar'))
  td.verify(next())
  t.is(ctx.id, 'hbar')
})

test('sets request id from header', t => {
  const { ctx, next } = t.context
  ctx.query.id = 'qbar'
  requestId({generator: () => 'foo'})(ctx, next)
  td.verify(ctx.set('x-request-id', 'qbar'))
  td.verify(next())
  t.is(ctx.id, 'qbar')
})
