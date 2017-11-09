import test from 'ava'
import td from 'testdouble'

import dependencyInjection from './dependency-injection'

test.beforeEach(t => {
  t.context.log = td.object(['child'])
  t.context.ctx = {
    state: {
      container: td.object(['registerValue', 'resolve'])
    },
    request: {}
  }
})

test('injects dependencies', t => {
  const childLog = td.object()
  const next = td.function()
  const nextPromise = Promise.resolve()

  const { ctx, log } = t.context
  ctx.state.id = 'req-id'
  ctx.request = {method: 'GET', baseUrl: '/foo', url: '/bar'}

  td.when(next()).thenReturn(nextPromise)
  td.when(ctx.state.container.resolve('log')).thenReturn(log)
  td.when(log.child({
    reqId: 'req-id',
    http: {url: '/foo/bar', method: 'GET'}
  })).thenReturn(childLog)

  const result = dependencyInjection({requestIdParamName: 'id'})(ctx, next)

  t.is(result, nextPromise)
  t.is(ctx.state.reqId, 'req-id')
  t.is(ctx.state.log, childLog)

  td.verify(ctx.state.container.registerValue({reqId: 'req-id'}))
  td.verify(ctx.state.container.registerValue({log: childLog}))
})
