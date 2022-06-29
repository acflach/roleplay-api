import Hash from '@ioc:Adonis/Core/Hash'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import UserFactory from 'Database/factories/UserFactory'

test.group('User', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
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
    // assert.equal(response.body().user.avatar, userPayload.avatar)
    //avatar não é validado na criação, só depois de registrado pode inserir avatar
  })

  test('it should return 409 when e-mail is already in use', async ({ client, assert }) => {
    const { email } = await UserFactory.create()
    const userPayload = {
      email,
      username: 'test',
      password: 'test',
      avatar: 'https://images.com/image/1',
    }

    const response = await client.post('/users').form(userPayload)
    response.assertStatus(409)
    assert.exists(response.body().message)
    assert.exists(response.body().code)
    assert.exists(response.body().status)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.include(response.body().message, 'e-mail')
  })

  test('it should return 409 when user name is already in use', async ({ client, assert }) => {
    const { username } = await UserFactory.create()
    const userPayload = {
      email: 'test@test.com',
      username,
      password: 'test',
      avatar: 'https://images.com/image/1',
    }

    const response = await client.post('/users').form(userPayload)
    response.assertStatus(409)
    assert.exists(response.body().message)
    assert.exists(response.body().code)
    assert.exists(response.body().status)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.include(response.body().message, 'user name')
  })

  test('it should return 422 when required data is not provided', async ({ client, assert }) => {
    const response = await client.post('/users').form({})
    response.assertStatus(422)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })

  test('it should return 422 when an ivalid email is provided', async ({ client, assert }) => {
    const userPayload = {
      email: 'test@',
      username: 'test',
      password: 'test',
      avatar: 'https://images.com/image/1',
    }
    const response = await client.post('/users').form({ userPayload })
    response.assertStatus(422)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })

  test('it should return 422 when an invalid password is provided', async ({ client, assert }) => {
    const userPayload = {
      email: 'test@test.com',
      username: 'test',
      password: 'tes',
      avatar: 'https://images.com/image/1',
    }
    const response = await client.post('/users').form({ userPayload })
    response.assertStatus(422)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })

  test('it should update an user', async ({ client, assert }) => {
    const { id, password } = await UserFactory.create()

    const email = 'test@test.com'
    const avatar = 'https://images.com/image/1'

    const response = await client.put(`/users/${id}`).form({
      email,
      avatar,
      password,
    })
    response.assertStatus(200)
    assert.exists(response.body().user, 'User undefined')
    assert.equal(response.body().user.email, email)
    assert.equal(response.body().user.avatar, avatar)
    assert.equal(response.body().user.id, id)
  })

  test('it should update the password of the user', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const password = 'test'

    const response = await client.put(`/users/${user.id}`).form({
      email: user.email,
      avatar: user.avatar,
      password,
    })

    response.assertStatus(200)

    await user.refresh()

    assert.exists(response.body().user, 'User undefined')
    assert.equal(response.body().user.id, user.id)
    assert.isTrue(await Hash.verify(user.password, password))
  })

  test('it should return 422 when required data is not provided', async ({ client, assert }) => {
    const { id } = await UserFactory.create()
    const response = await client.put(`/users/${id}`).form({})
    response.assertStatus(422)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })

  test('it should return 422 when an ivalid email is provided', async ({ client, assert }) => {
    const { id, avatar, password } = await UserFactory.create()
    const response = await client.put(`/users/${id}`).form({
      email: 'test@',
      avatar,
      password,
    })
    response.assertStatus(422)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })

  test('it should return 422 when an invalid password is provided', async ({ client, assert }) => {
    const { id, avatar, email } = await UserFactory.create()
    const response = await client.put(`/users/${id}`).form({
      email,
      avatar,
      password: 'tes',
    })
    response.assertStatus(422)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })

  test('it should return 422 when an invalid avatar is provided', async ({ client, assert }) => {
    const { id, password, email } = await UserFactory.create()
    const response = await client.put(`/users/${id}`).form({
      email,
      avatar: 'test',
      password,
    })
    response.assertStatus(422)
    assert.equal(response.body().code, 'BAD_REQUEST')
    assert.equal(response.body().status, 422)
  })
})
