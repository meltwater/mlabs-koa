import test from 'ava'
import td from 'testdouble'

import { default as koaLogger, log as koaLog } from './logger'

test.beforeEach(t => {
  t.context.nextPromise = Promise.resolve()
  t.context.next = () => t.context.nextPromise
  t.context.log = td.object(['info', 'child'])
  t.context.childLog = td.object()
  t.context.ctx = {
    state: {
      log: t.context.log
    },
    request: {},
    response: {length: 53}
  }
})

test('logs request', async t => {
  const { ctx, log, childLog } = t.context
  const next = async () => {}
  ctx.state.logHttp = {method: 'GET'}

  td.when(log.child({http: {
    resSize: 53,
    resTime: td.matchers.isA(Number),
    method: 'GET'
  }})).thenReturn(childLog)

  await koaLogger({level: 'info'})(ctx, next)

  t.is(ctx.state.log, childLog)
  td.verify(log.info('Request: Start'))
  td.verify(childLog.info('Request: End'))
})

test('checks arguments', t => {
  const msg = /Logger middleware/
  t.throws(() => koaLogger({level: ''}), msg, 'when bad level')
})

test('injects child logger', t => {
  const { ctx, log, childLog, next, nextPromise } = t.context
  ctx.state.rId = 'req-id'
  ctx.request = {method: 'GET', baseUrl: '/foo', url: '/bar'}

  td.when(log.child({
    reqId: 'req-id',
    http: {url: '/foo/bar', method: 'GET'}
  })).thenReturn(childLog)

  const result = koaLog({requestIdParamName: 'rId'})(ctx, next)

  t.is(result, nextPromise)
  t.is(ctx.state.log, childLog)
})

test('injects child logger without http', t => {
  const { ctx, log, childLog, next, nextPromise } = t.context
  ctx.state.rId = 'req-id'
  td.when(log.child({reqId: 'req-id'})).thenReturn(childLog)
  const result = koaLog({requestIdParamName: 'rId', addHttp: false})(ctx, next)
  t.is(result, nextPromise)
  t.is(ctx.state.log, childLog)
})
