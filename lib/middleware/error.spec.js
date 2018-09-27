import test from 'ava'
import td from 'testdouble'
import { badRequest, notFound } from 'boom'

import error, { isErrorCode, createError } from './error'

test.beforeEach(t => {
  t.context.ctx = {
    app: { emit: td.function() }
  }
})

test('is error code', t => {
  t.true(isErrorCode(400))
  t.true(isErrorCode(450))
  t.true(isErrorCode(499))
  t.true(isErrorCode(500))
  t.true(isErrorCode(550))
  t.true(isErrorCode(599))
})

test('is not error code', t => {
  t.false(isErrorCode(100))
  t.false(isErrorCode(199))
  t.false(isErrorCode(200))
  t.false(isErrorCode(201))
  t.false(isErrorCode(299))
  t.false(isErrorCode(300))
  t.false(isErrorCode(399))
})

test('creates not found error', t => {
  const err = createError(404)
  t.is(err.message, 'Not Found')
  t.is(err.output.statusCode, 404)
})

test('creates unknown error', t => {
  const err = createError(999)
  t.is(err.message, 'Unknown Error')
  t.is(err.output.statusCode, 999)
})

test('creates unsupported boom error', t => {
  const err = createError(425)
  t.is(err.message, 'Unordered Collection')
  t.is(err.output.statusCode, 425)
})

test('handles no error', async t => {
  const ctx = { status: 200 }
  const next = async () => {}
  await error()(ctx, next)
  t.deepEqual(ctx, { status: 200 })
})

test('handles standard error', async t => {
  const err = new Error('foo')
  err.data = { never: 'show' }
  const { ctx } = t.context
  const next = async () => { throw err }
  await error()(ctx, next)

  const body = {
    error: 'Internal Server Error',
    message: 'foo',
    data: null,
    status: 500,
    statusCode: 500
  }

  t.true(err.expose)
  t.is(ctx.status, 500)
  t.deepEqual(ctx.body, body)
  td.verify(t.context.ctx.app.emit('error', err, ctx))
})

test('does not expose server error', async t => {
  const err = new Error('foo')
  const { ctx } = t.context
  const next = async () => { throw err }
  await error({ isServerErrorExposed: false })(ctx, next)

  const body = {
    error: 'Internal Server Error',
    message: 'An internal server error occurred',
    data: null,
    status: 500,
    statusCode: 500
  }

  t.false(err.expose)
  t.is(ctx.status, 500)
  t.deepEqual(ctx.body, body)
  td.verify(t.context.ctx.app.emit('error', err, ctx))
})

test('handles boom error', async t => {
  const err = badRequest('No good', { foo: 'bar' })
  const { ctx } = t.context
  const next = async () => { throw err }
  await error({ isServerErrorExposed: false })(ctx, next)

  const body = {
    error: 'Bad Request',
    message: 'No good',
    data: { foo: 'bar' },
    status: 400,
    statusCode: 400
  }

  t.is(ctx.status, 400)
  t.deepEqual(ctx.body, body)
  td.verify(t.context.ctx.app.emit('error', err, ctx))
})

test('handles 404 status', async t => {
  const { ctx } = t.context
  ctx.status = 404
  const next = async () => {}
  await error()(ctx, next)

  const body = {
    error: 'Not Found',
    message: 'Not Found',
    data: null,
    status: 404,
    statusCode: 404
  }

  t.is(ctx.status, 404)
  t.deepEqual(ctx.body, body)
  td.verify(t.context.ctx.app.emit('error', notFound(), ctx))
})

test('handles custom body', async t => {
  const body = { foo: 'bar' }
  const { ctx } = t.context
  ctx.status = 566
  ctx.body = body
  const next = async () => {}
  await error()(ctx, next)

  t.is(ctx.status, 566)
  t.deepEqual(ctx.body, body)
  td.verify(t.context.ctx.app.emit('error', createError(566), ctx))
})

test('uses body if set', async t => {
  const body = { foo: 'bar' }
  const err = badRequest('No good', { foo: 'bar' })
  const { ctx } = t.context
  ctx.body = body
  const next = async () => { throw err }
  await error({ isServerErrorExposed: false })(ctx, next)

  t.is(ctx.status, 400)
  t.deepEqual(ctx.body, body)
  td.verify(t.context.ctx.app.emit('error', err, ctx))
})
