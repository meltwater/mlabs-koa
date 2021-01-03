import test from 'ava'
import td from 'testdouble'

import { matchOrigin } from './cors.js'

test('does not match empty list checks', async (t) => {
  const ctx = mockOrigin('example.com')
  t.is(matchOrigin([])(ctx), null)
})

test('does not match other domain', async (t) => {
  const ctx = mockOrigin('example.com')
  t.is(
    matchOrigin(['foo.example.com', '*.example.com', 'google.com'])(ctx),
    null
  )
})

test('matches exact domain', async (t) => {
  const ctx = mockOrigin('example.com')
  t.is(matchOrigin(['example.com', 'google.com'])(ctx), 'example.com')
})

test('matches glob domain', async (t) => {
  const ctx = mockOrigin('foo.example.com')
  t.is(matchOrigin(['*.example.com', 'google.com'])(ctx), 'foo.example.com')
})

const mockOrigin = (origin) => {
  const ctx = { request: { get: td.function() } }
  td.when(ctx.request.get('origin')).thenReturn(origin)
  return ctx
}
