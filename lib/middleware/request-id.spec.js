import test from 'ava'
import td from 'testdouble'

import requestId from './request-id'

test.beforeEach(t => {
  t.context.nextPromise = Promise.resolve()
  t.context.next = () => t.context.nextPromise
  t.context.ctx = {
    get: td.function(),
    set: td.function(),
    state: {}
  }
})

test('sets request id', t => {
  const { ctx, next, nextPromise } = t.context
  const result = requestId({ generator: () => 'foo' })(ctx, next)
  td.verify(ctx.set('x-request-id', 'foo'))
  t.is(result, nextPromise)
  t.is(ctx.state.reqId, 'foo')
})

test('sets request id with custom name', t => {
  const { ctx, next, nextPromise } = t.context
  const result = requestId({ paramName: 'rid', generator: () => 'foo' })(ctx, next)
  td.verify(ctx.set('x-request-id', 'foo'))
  t.is(result, nextPromise)
  t.is(ctx.state.rid, 'foo')
})

test('sets request id from context', t => {
  const { ctx, next, nextPromise } = t.context
  ctx.state.reqId = 'bar'
  td.when(ctx.get('x-request-id')).thenReturn('hbar')
  const result = requestId({ generator: () => 'foo' })(ctx, next)
  td.verify(ctx.set('x-request-id', 'bar'))
  t.is(result, nextPromise)
  t.is(ctx.state.reqId, 'bar')
})

test('sets request id from header', t => {
  const { ctx, next, nextPromise } = t.context
  td.when(ctx.get('x-request-id')).thenReturn('hbar')
  const result = requestId({ generator: () => 'foo' })(ctx, next)
  td.verify(ctx.set('x-request-id', 'hbar'))
  t.is(result, nextPromise)
  t.is(ctx.state.reqId, 'hbar')
})

test('checks arguments', t => {
  const err = { message: /Request id middleware/ }
  t.throws(() => requestId({ reqHeader: '' }), err, 'when bad req header')
  t.throws(() => requestId({ resHeader: 44 }), err, 'when bad res header')
  t.throws(() => requestId({ paramName: 3 }), err, 'when bad param name')
})
