import test from 'ava'
import td from 'testdouble'
import { badRequest, notFound } from 'boom'

import error from './error'

test.beforeEach(t => {
  t.context.ctx = {
    app: {emit: td.function()}
  }
})

test('handles no error', async t => {
  const ctx = {status: 200}
  const next = async () => {}
  await error()(ctx, next)
  t.deepEqual(ctx, {status: 200})
})

test('handles standard error', async t => {
  const err = new Error('foo')
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

  t.is(err.status, 500)
  t.true(err.expose)
  t.deepEqual(err.body, body)

  t.is(ctx.status, 500)
  t.deepEqual(ctx.body, body)

  td.verify(t.context.ctx.app.emit('error', err, ctx))
})

test('does not expose server error', async t => {
  const err = new Error('foo')
  const { ctx } = t.context
  const next = async () => { throw err }
  await error({isServerErrorExposed: false})(ctx, next)

  const body = {
    error: 'Internal Server Error',
    message: 'An internal server error occurred',
    data: null,
    status: 500,
    statusCode: 500
  }

  t.is(err.status, 500)
  t.false(err.expose)
  t.deepEqual(err.body, body)

  t.is(ctx.status, 500)
  t.deepEqual(ctx.body, body)

  td.verify(t.context.ctx.app.emit('error', err, ctx))
})

test('handles boom error', async t => {
  const err = badRequest('No good', {foo: 'bar'})
  const { ctx } = t.context
  const next = async () => { throw err }
  await error({isServerErrorExposed: false})(ctx, next)

  const body = {
    error: 'Bad Request',
    message: 'No good',
    data: {foo: 'bar'},
    status: 400,
    statusCode: 400
  }

  t.is(err.status, 400)
  t.true(err.expose)
  t.deepEqual(err.body, body)

  t.is(ctx.status, 400)
  t.deepEqual(ctx.body, body)

  td.verify(t.context.ctx.app.emit('error', err, ctx))
})

test('handles 404', async t => {
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
