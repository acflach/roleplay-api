import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BadRequestException from 'App/Exceptions/BadRequestException'
import User from 'App/Models/User'

export default class UsersController {
  public async store({ request, response }: HttpContextContract) {
    const userPayload = request.only(['email', 'username', 'password', 'avatar'])
    if (!userPayload.email || !userPayload.username || !userPayload.password) {
      throw new BadRequestException('required data not provided', 422)
    }

    const userByEmail = await User.findBy('email', userPayload.email)
    if (userByEmail) throw new BadRequestException('e-mail already in use', 409)

    const userByUsername = await User.findBy('username', userPayload.username)
    if (userByUsername) throw new BadRequestException('user name already in use', 409)

    const user = await User.create(userPayload)
    return response.created({ user })
  }
}
