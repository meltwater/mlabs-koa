import test from 'ava'

import splitName from './split-name.js'

test('splits names', (t) => {
  t.deepEqual(splitName(), [])
  t.deepEqual(splitName(''), [])
  t.deepEqual(splitName('foobar'), ['foobar'])
  t.deepEqual(splitName('foo-bar'), ['foo-bar'])
  t.deepEqual(splitName('@foo/bar'), ['bar'])
  t.deepEqual(splitName('@foo/bar-baz'), ['baz', 'bar'])
  t.deepEqual(splitName('@foo/bar-abc-def-xxx'), ['abc-def-xxx', 'bar'])
})
