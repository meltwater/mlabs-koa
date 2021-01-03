import test from 'ava'
import * as td from 'testdouble'

import koaLogger, { log as koaLog } from './logger.js'

const logProps = { isRequestLog: true, isAppLog: false }

test.beforeEach((t) => {
  t.context.nextPromise = Promise.resolve()
  t.context.next = () => t.context.nextPromise
  t.context.log = td.object(['info', 'child'])
  t.context.childLog = td.object()
  t.context.ctx = {
    get: (k) => (k === 'rN' ? 'foo' : ''),
    state: {
      log: t.context.log
    },
    request: {},
    response: { headers: { foo: 'bar' }, length: 53, status: 200 }
  }
})

test('logs request', async (t) => {
  const { ctx, log } = t.context
  const next = async () => {}

  const res = {
    size: 53,
    time: td.matchers.isA(Number),
    headers: { foo: 'bar' },
    statusCode: 200
  }

  await koaLogger({ level: 'info' })(ctx, next)

  t.is(ctx.state.log, log)
  td.verify(log.info({ req: ctx.request, ...logProps }, 'Request: Start'))
  td.verify(log.info({ resStatusCode: 200, res, ...logProps }, 'Request: End'))
})

test('checks arguments', (t) => {
  const err = { message: /Logger middleware/ }
  t.throws(() => koaLogger({ level: '' }), err, 'when bad level')
})

test('injects child logger', (t) => {
  const { ctx, log, childLog, next, nextPromise } = t.context
  ctx.state.rId = 'req-id'
  ctx.request = { method: 'GET', baseUrl: '/foo', url: '/bar' }

  td.when(
    log.child({
      serializers: td.matchers.contains({ res: td.matchers.argThat((x) => x) }),
      reqMethod: 'GET',
      reqUrl: '/bar',
      reqName: 'foo',
      reqId: 'req-id',
      execId: 'exec-id',
      req: ctx.request
    })
  ).thenReturn(childLog)

  const result = koaLog({
    requestIdParamName: 'rId',
    reqNameHeader: 'rN',
    generator: () => 'exec-id'
  })(ctx, next)

  t.is(result, nextPromise)
  t.is(ctx.state.log, childLog)
})

test('injects child logger without http', (t) => {
  const { ctx, log, childLog, next, nextPromise } = t.context
  ctx.state.rId = 'req-id'

  td.when(
    log.child({
      serializers: td.matchers.contains({ res: td.matchers.argThat((x) => x) }),
      execId: 'exec-id',
      reqId: 'req-id',
      reqName: 'foo'
    })
  ).thenReturn(childLog)

  const result = koaLog({
    requestIdParamName: 'rId',
    reqNameHeader: 'rN',
    addReq: false,
    generator: () => 'exec-id'
  })(ctx, next)
  t.is(result, nextPromise)
  t.is(ctx.state.log, childLog)
})
