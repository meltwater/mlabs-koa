import test from 'ava'
import td from 'testdouble'

import dependencyInjection from './dependency-injection'

test.beforeEach(t => {
  t.context.log = td.object(['child'])
  t.context.ctx = {
    state: {
      container: td.object(['register', 'resolve'])
    },
    request: {}
  }
})

test('injects dependencies', t => {
  const childLog = td.object()
  const nextPromise = Promise.resolve()
  const next = () => nextPromise

  const { ctx, log } = t.context
  ctx.state.id = 'req-id'
  ctx.request = {method: 'GET', baseUrl: '/foo', url: '/bar'}

  td.when(ctx.state.container.resolve('log')).thenReturn(log)
  td.when(log.child({
    reqId: 'req-id',
    http: {url: '/foo/bar', method: 'GET'}
  })).thenReturn(childLog)

  const result = dependencyInjection({requestIdParamName: 'id'})(ctx, next)

  t.is(result, nextPromise)
  t.is(ctx.state.reqId, 'req-id')
  t.is(ctx.state.log, childLog)

  td.verify(ctx.state.container.register({
    reqId: td.matchers.isA(Object),
    log: td.matchers.isA(Object)
  }))
})
