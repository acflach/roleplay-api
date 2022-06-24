import { test } from '@japa/runner'

test.group('Example', () => {
  test('assert sum', ({ assert }) => {
    assert.equal(2 + 2, 4)
  })
})
