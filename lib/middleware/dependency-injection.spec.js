import test from 'ava'
import td from 'testdouble'

import dependencyInjection from './dependency-injection.js'

test.beforeEach((t) => {
  t.context.ctx = {
    state: {
      log: td.object(),
      rId: 'req-id',
      container: td.object(['register'])
    }
  }
})

test('injects dependencies', (t) => {
  const nextPromise = Promise.resolve()
  const next = () => nextPromise
  const { ctx } = t.context
  const result = dependencyInjection({ requestIdParamName: 'rId' })(ctx, next)
  t.is(result, nextPromise)
  td.verify(
    ctx.state.container.register({
      reqId: td.matchers.isA(Object),
      log: td.matchers.isA(Object)
    })
  )
})
