import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import UserFactory from 'Database/factories/UserFactory'

test.group('User', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    await Database.rollbackGlobalTransaction()
  })

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
    assert.notExists(response.body().user.password, 'Password defined')
    assert.equal(response.body().user.avatar, userPayload.avatar)
  })

  test('it should return 409 when e-mail is already in use', async ({ client, assert }) => {
    const { email } = await UserFactory.create()
    const userPayload = {
      email,
      username: 'test',
      password: 'test',
      avatar: 'https://images.com/image/2',
    }

    const response = await client.post('/users').form(userPayload)
    response.assertStatus(409)
    assert.exists(response.body().message)
    assert.exists(response.body().code)
    assert.exists(response.body().status)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.include(response.body().message, 'e-mail')
    assert.equal(response.body().status, 409)
  })

  test('it should return 409 when user name is already in use', async ({ client, assert }) => {
    const { username } = await UserFactory.create()
    const userPayload = {
      email: 'test@test.com',
      username,
      password: 'test',
      avatar: 'https://images.com/image/2',
    }

    const response = await client.post('/users').form(userPayload)
    response.dump()
    response.assertStatus(409)
    assert.exists(response.body().message)
    assert.exists(response.body().code)
    assert.exists(response.body().status)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.include(response.body().message, 'user name')
    assert.equal(response.body().status, 409)
  })

  test('it should return 422 when required data is not provided', async ({ client }) => {
    const response = await client.post('/users').form({})
    response.dump()
    response.assertStatus(422)
    // assert.exists(response.body().message)
    // assert.exists(response.body().code)
    // assert.exists(response.body().status)
    // assert.equal(response.body().code, 'BAD_REQUEST')
    // assert.include(response.body().message, 'user name')
    // assert.equal(response.body().status, 409)
  }).pin()
})
