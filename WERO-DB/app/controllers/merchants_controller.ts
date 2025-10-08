import { HttpContext } from '@adonisjs/core/http'
import Merchant from '#models/merchant'

export default class MerchantsController {
  // Liste tous les marchands
  public async index({ response }: HttpContext) {
    const merchants = await Merchant.query().preload('currency')
    return response.ok(merchants)
  }

  // Crée un nouveau marchand
  public async store({ request, response }: HttpContext) {
    const data = request.only([
      'name',
      'address',
      'city',
      'postal_code',
      'balance',
      'currency_id',
    ])

    try {
      const merchant = await Merchant.create(data)
      await merchant.load('currency')
      return response.created(merchant)
    } catch (error) {
      return response.badRequest(error.message)
    }
  }

  // Affiche un marchand par ID
  public async show({ params, response }: HttpContext) {
    try {
      const merchant = await Merchant.findOrFail(params.id)
      await merchant.load('currency')
      return response.ok(merchant)
    } catch {
      return response.notFound('Merchant not found')
    }
  }

  // Met à jour un marchand
  public async update({ params, request, response }: HttpContext) {
    try {
      const merchant = await Merchant.findOrFail(params.id)
      const data = request.only([
        'name',
        'address',
        'city',
        'postal_code',
        'balance',
        'currency_id',
      ])
      merchant.merge(data)
      await merchant.save()
      await merchant.load('currency')
      return response.ok(merchant)
    } catch {
      return response.notFound('Merchant not found')
    }
  }

  // Supprime un marchand
  public async destroy({ params, response }: HttpContext) {
    try {
      const merchant = await Merchant.findOrFail(params.id)
      await merchant.delete()
      return response.noContent()
    } catch {
      return response.notFound('Merchant not found')
    }
  }
}
