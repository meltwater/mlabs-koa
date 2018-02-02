import test from 'ava'
import td from 'testdouble'

import { default as koaLogger, log as koaLog } from './logger'

test.beforeEach(t => {
  t.context.nextPromise = Promise.resolve()
  t.context.next = () => t.context.nextPromise
  t.context.log = td.object(['info', 'child'])
  t.context.childLog = td.object()
  t.context.ctx = {
    get: k => k === 'rN' ? 'foo' : '',
    state: {
      log: t.context.log
    },
    request: {},
    response: {headers: {foo: 'bar'}, length: 53, status: 200}
  }
})

test('logs request', async t => {
  const { ctx, log } = t.context
  const next = async () => {}

  const res = {
    size: 53,
    time: td.matchers.isA(Number),
    headers: {foo: 'bar'},
    statusCode: 200
  }

  await koaLogger({level: 'info'})(ctx, next)

  t.is(ctx.state.log, log)
  td.verify(log.info({req: ctx.request}, 'Request: Start'))
  td.verify(log.info({res}, 'Request: End'))
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
    serializers: td.matchers.contains({res: td.matchers.argThat(x => x)}),
    reqName: 'foo',
    reqId: 'req-id',
    req: ctx.request
  })).thenReturn(childLog)

  const result = koaLog({
    requestIdParamName: 'rId',
    reqNameHeader: 'rN'
  })(ctx, next)

  t.is(result, nextPromise)
  t.is(ctx.state.log, childLog)
})

test('injects child logger without http', t => {
  const { ctx, log, childLog, next, nextPromise } = t.context
  ctx.state.rId = 'req-id'

  td.when(log.child({
    serializers: td.matchers.contains({res: td.matchers.argThat(x => x)}),
    reqId: 'req-id',
    reqName: 'foo'
  })).thenReturn(childLog)

  const result = koaLog({
    requestIdParamName: 'rId',
    reqNameHeader: 'rN',
    addReq: false
  })(ctx, next)
  t.is(result, nextPromise)
  t.is(ctx.state.log, childLog)
})
