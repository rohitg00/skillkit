'use strict'

const assert = require('assert')

const result = require('./')(argv => {
  assert.strictEqual(argv.foo, '1')
  assert.strictEqual(argv.bar, 'baz')
  assert.strictEqual(argv.qux, true)
  assert.deepStrictEqual(argv._, ['quux'])

  return 123
}, { string: ['foo'], boolean: ['qux'] }, ['--foo', '1', '--bar', 'baz', '--qux', 'quux'])

assert.strictEqual(result, 123)

console.log('test ok!')
