import { HttpContext } from '@adonisjs/core/http'
import Currency from '#models/currency'

export default class CurrenciesController {
  // Liste toutes les devises
  public async index({ response }: HttpContext) {
    const currencies = await Currency.all()
    return response.ok(currencies)
  }

  // Crée une nouvelle devise
  public async store({ request, response }: HttpContext) {
    const data = request.only(['code', 'name', 'symbol'])

    try {
      const currency = await Currency.create(data)
      return response.created(currency)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  // Affiche une devise par ID
  public async show({ params, response }: HttpContext) {
    try {
      const currency = await Currency.findOrFail(params.id)
      return response.ok(currency)
    } catch {
      return response.notFound('Currency not found')
    }
  }

  // Met à jour une devise
  public async update({ params, request, response }: HttpContext) {
    try {
      const currency = await Currency.findOrFail(params.id)
      const data = request.only(['code', 'name', 'symbol'])
      currency.merge(data)
      await currency.save()
      return response.ok(currency)
    } catch {
      return response.notFound('Currency not found')
    }
  }

  // Supprime une devise
  public async destroy({ params, response }: HttpContext) {
    try {
      const currency = await Currency.findOrFail(params.id)
      await currency.delete()
      return response.noContent()
    } catch {
      return response.notFound('Currency not found')
    }
  }
}
