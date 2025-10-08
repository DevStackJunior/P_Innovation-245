import Wallet from '#models/wallet'
import { HttpContext } from '@adonisjs/core/http'

export default class WalletsController {
  public async create({ request, response }: HttpContext) {
    try {
      const payload = request.only(['name', 'userId', 'currencyId', 'balance_cents'])
      const wallet = await Wallet.create(payload)
      return response.created(wallet)
    } catch (error) {
      console.error('Wallet creation error:', error)
      return response.internalServerError('Failed to create wallet')
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const wallet = await Wallet.findOrFail(params.id)
      await wallet.load('user')
      await wallet.load('currency')
      return response.ok(wallet)
    } catch {
      return response.notFound('Wallet not found')
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const wallet = await Wallet.findOrFail(params.id)
      const payload = request.only(['name', 'userId', 'currencyId', 'balance_cents'])
      wallet.merge(payload)
      await wallet.save()
      return response.ok(wallet)
    } catch {
      return response.notFound('Wallet not found')
    }
  }

  public async delete({ params, response }: HttpContext) {
    try {
      const wallet = await Wallet.findOrFail(params.id)
      await wallet.delete()
      return response.noContent()
    } catch {
      return response.notFound('Wallet not found')
    }
  }
}
