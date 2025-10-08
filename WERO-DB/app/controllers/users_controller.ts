import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  public async create({ request, response }: HttpContext) {
    try {
      const payload = request.only(['pseudo', 'email', 'balance', 'currencyId'])

      // Optionnel: tu peux ajouter une validation ici

      const user = await User.create(payload)
      return response.created(user)
    } catch (error) {
      console.error('User creation error:', error)
      return response.internalServerError('Failed to create user')
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      await user.load('currency')
      return response.ok(user)
    } catch {
      return response.notFound('User not found')
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      const payload = request.only(['pseudo', 'email', 'balance', 'currencyId'])
      user.merge(payload)
      await user.save()
      return response.ok(user)
    } catch {
      return response.notFound('User not found')
    }
  }

  public async delete({ params, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      await user.delete()
      return response.noContent()
    } catch {
      return response.notFound('User not found')
    }
  }
}
