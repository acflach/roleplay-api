import { test } from '@japa/runner'

test.group('User', () => {
  test('it should create an user', async ({ client, assert }) => {
    const userPayload = {
      email: 'test@test.com',
      username: 'test',
      password: 'test',
      avatar: 'https://images.com/image/1',
    }
    const response = await client.post('/users').form(userPayload)
    response.assertStatus(201)
    assert.exists(response.body().user, 'User undefined')
    assert.exists(response.body().user.id, 'Id undefined')
    assert.equal(response.body().user.email, userPayload.email)
    assert.equal(response.body().user.username, userPayload.username)
    assert.equal(response.body().user.password, userPayload.password)
    assert.equal(response.body().user.avatar, userPayload.avatar)
  })
})
